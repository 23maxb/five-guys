from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.core.mail import EmailMessage
from django.conf import settings
import requests
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime
from .models import Fridge, FridgeItem
from .serializers import FridgeSerializer, FridgeItemSerializer
from .const import SPOONACULAR_API_KEY


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint that accepts email/password and returns a token
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find user by email (assuming email is stored in username field for simplicity)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Authenticate user
    user = authenticate(username=user.username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.first_name or user.username
            }
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register endpoint to create new users
    """
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name', '')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'User with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create new user
    user = User.objects.create_user(
        username=email,  # Using email as username
        email=email,
        password=password,
        first_name=name
    )

    # Create token for new user
    token = Token.objects.create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.first_name or user.username
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def logout_view(request):
    """
    Logout endpoint to delete user token
    """
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'message': 'Successfully logged out'})


@api_view(['GET'])
def user_profile(request):
    """
    Get current user profile
    """
    return Response({
        'user': {
            'id': request.user.id,
            'email': request.user.email,
            'name': request.user.first_name or request.user.username
        }
    })


@api_view(['GET'])
def view_fridge(request):
    """
    View the contents of the user's default fridge.
    """
    fridge, created = Fridge.objects.get_or_create(user=request.user, name='Main Fridge')
    serializer = FridgeSerializer(fridge)
    return Response(serializer.data)


@api_view(['POST'])
def add_fridge_item(request):
    """
    Add an item to the user's default fridge.
    Expects {'name': 'item_name', 'quantity': 1} in the request body.
    """
    fridge, _ = Fridge.objects.get_or_create(user=request.user, name='Main Fridge')
    name = request.data.get('name')
    quantity = request.data.get('quantity', 1)

    if not name:
        return Response({'error': 'Item name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if item already exists and update quantity
    item, created = FridgeItem.objects.get_or_create(
        fridge=fridge,
        name__iexact=name,  # Case-insensitive check
        defaults={'name': name, 'quantity': quantity}
    )

    if not created:
        # If item already existed, update its quantity
        item.quantity += int(quantity)
        item.save()

    serializer = FridgeItemSerializer(item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
def update_fridge_item_quantity(request, item_id):
    """
    Update the quantity of a fridge item.
    """
    try:
        item = FridgeItem.objects.get(id=item_id, fridge__user=request.user)
        quantity = request.data.get('quantity')

        if quantity is None:
            return Response({'error': 'Quantity is required.'}, status=status.HTTP_400_BAD_REQUEST)

        quantity = int(quantity)

        if quantity <= 0:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        item.quantity = quantity
        item.save()

        serializer = FridgeItemSerializer(item)
        return Response(serializer.data)
    except FridgeItem.DoesNotExist:
        return Response({'error': 'Item not found in your fridge.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
def remove_fridge_item(request, item_id):
    """
    Remove an item from the fridge by its ID.
    """
    try:
        item = FridgeItem.objects.get(id=item_id, fridge__user=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except FridgeItem.DoesNotExist:
        return Response({'error': 'Item not found in your fridge.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
def clear_fridge(request):
    """
    Remove all items from the user's default fridge.
    """
    try:
        fridge = Fridge.objects.get(user=request.user, name='Main Fridge')
        fridge.items.all().delete()
        return Response({'message': 'Fridge has been cleared.'}, status=status.HTTP_200_OK)
    except Fridge.DoesNotExist:
        # If the fridge doesn't exist, there's nothing to clear.
        return Response({'message': 'Fridge is already empty.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def find_recipes_by_ingredients(request):
    """
    Finds recipes based on the ingredients in the user's fridge
    by calling the Spoonacular API.
    """

    try:
        fridge = Fridge.objects.get(user=request.user, name='Main Fridge')
        ingredients = [item.name for item in fridge.items.all()]
    except Fridge.DoesNotExist:
        ingredients = []

    if not ingredients:
        return Response({'message': 'Your fridge is empty. Add some items to find recipes.'},
                        status=status.HTTP_400_BAD_REQUEST)

    ingredients_str = ",".join(ingredients)

    params = {
        'ingredients': ingredients_str,
        'number': 10,  # Return up to 10 recipes
        'ranking': 1,  # Maximize used ingredients
        'ignorePantry': True,
        'apiKey': SPOONACULAR_API_KEY
    }

    response = requests.get('https://api.spoonacular.com/recipes/findByIngredients', params=params)

    if response.status_code == 200:
        return Response(response.json())
    else:
        return Response({'error': 'Failed to fetch recipes from Spoonacular.'}, status=response.status_code)


@api_view(['GET'])
def get_analyzed_recipe_instructions(request, recipe_id):
    """
    Get an analyzed breakdown of a recipe's instructions.
    """
    params = {
        'stepBreakdown': True,
        'apiKey': SPOONACULAR_API_KEY
    }
    response = requests.get(f'https://api.spoonacular.com/recipes/{recipe_id}/analyzedInstructions', params=params)
    if response.status_code == 200:
        return Response(response.json())
    else:
        return Response({'error': 'Failed to fetch recipe instructions from Spoonacular.'}, status=response.status_code)


@api_view(['GET'])
def get_recipe_information(request, recipe_id):
    """
    Get full information about a recipe.
    """
    include_nutrition = request.query_params.get('includeNutrition', 'false').lower() == 'true'
    add_wine_pairing = request.query_params.get('addWinePairing', 'false').lower() == 'true'
    add_taste_data = request.query_params.get('addTasteData', 'false').lower() == 'true'

    params = {
        'includeNutrition': include_nutrition,
        'addWinePairing': add_wine_pairing,
        'addTasteData': add_taste_data,
        'apiKey': SPOONACULAR_API_KEY
    }

    response = requests.get(f'https://api.spoonacular.com/recipes/{recipe_id}/information', params=params)

    print(response.json())
    if response.status_code == 200:
        return Response(response.json())
    else:
        return Response({'error': 'Failed to fetch recipe information from Spoonacular.'}, status=response.status_code)


@api_view(['POST'])
def share_calendar_pdf(request):
    """
    Generate a PDF of the meal plan calendar and send it via email.
    Expects {'email': 'recipient@example.com', 'mealPlan': {...}, 'weekRange': 'Jan 1 – Jan 7'} in request body.
    """
    recipient_email = request.data.get('email')
    meal_plan = request.data.get('mealPlan', {})
    week_range = request.data.get('weekRange', '')

    if not recipient_email:
        return Response(
            {'error': 'Email address is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not meal_plan:
        return Response(
            {'error': 'Meal plan data is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#10b981'),
            spaceAfter=30,
            alignment=1,  # Center alignment
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=12,
        )
        normal_style = styles['Normal']

        # Title
        elements.append(Paragraph("Meal Plan Calendar", title_style))
        if week_range:
            elements.append(Paragraph(f"Week of {week_range}", normal_style))
        elements.append(Paragraph(f"Shared by {request.user.first_name or request.user.username}", normal_style))
        elements.append(Spacer(1, 0.3 * inch))

        # Process meal plan data
        meal_slots = ["Breakfast", "Lunch", "Dinner"]
        
        # Sort days chronologically
        sorted_days = sorted(meal_plan.items())
        
        for day_key, day_plan in sorted_days:
            # Parse date from day_key (format: YYYY-MM-DD)
            try:
                date_obj = datetime.strptime(day_key, '%Y-%m-%d')
                day_name = date_obj.strftime('%A')
                date_str = date_obj.strftime('%B %d, %Y')
            except:
                day_name = day_key
                date_str = day_key

            # Day header
            elements.append(Paragraph(f"<b>{day_name}</b> - {date_str}", heading_style))
            
            # Create table for meals
            meal_data = [['Meal', 'Recipe', 'Time', 'Servings']]
            
            for slot in meal_slots:
                if slot in day_plan:
                    recipe = day_plan[slot]
                    meal_data.append([
                        slot,
                        recipe.get('title', 'N/A'),
                        f"{recipe.get('readyInMinutes', 'N/A')} min" if recipe.get('readyInMinutes') else 'N/A',
                        str(recipe.get('servings', 'N/A'))
                    ])
                else:
                    meal_data.append([slot, 'No meal planned', '-', '-'])

            # Create table
            table = Table(meal_data, colWidths=[1.2*inch, 3*inch, 1*inch, 0.8*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            ]))
            
            elements.append(table)
            elements.append(Spacer(1, 0.3 * inch))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        pdf_content = buffer.getvalue()
        buffer.close()

        # Send email with PDF attachment
        subject = f"Meal Plan Calendar - {week_range or 'Your Meal Plan'}"
        message = f"""
Hello!

{request.user.first_name or request.user.username} has shared their meal plan calendar with you.

This PDF contains the meal plan for the week of {week_range or 'the selected period'}.

Enjoy your meals!

Best regards,
YumYum App
        """.strip()

        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
        )
        email.attach('meal_plan_calendar.pdf', pdf_content, 'application/pdf')
        email.send()

        return Response({
            'message': f'Meal plan calendar has been sent to {recipient_email} successfully!'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to generate and send PDF: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
