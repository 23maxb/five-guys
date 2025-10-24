from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

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