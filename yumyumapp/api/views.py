from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
import requests
from .models import Fridge, FridgeItem
from .serializers import FridgeSerializer, FridgeItemSerializer


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
    SPOONACULAR_API_KEY = '760dae2f56cd42d7b7ffc86d6a78a5a6'

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
