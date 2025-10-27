from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase


class AuthViewsTestCase(APITestCase):
    def setUp(self):
        """Set up a test user and other initial data."""
        self.user_data = {
            'username': 'test@example.com',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'first_name': 'Test'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.token = Token.objects.create(user=self.user)
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.profile_url = reverse('profile')

    # --- Registration Tests (register_view) ---

    def test_register_success(self):
        """1. Test successful user registration."""
        data = {'email': 'newuser@example.com', 'password': 'newpassword123', 'name': 'New User'}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_register_email_already_exists(self):
        """2. Test registration with an email that already exists."""
        data = {'email': self.user_data['email'], 'password': 'anotherpassword'}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User with this email already exists')

    def test_register_missing_email(self):
        """3. Test registration with a missing email."""
        data = {'password': 'somepassword'}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email and password are required')

    def test_register_missing_password(self):
        """4. Test registration with a missing password."""
        data = {'email': 'anotheruser@example.com'}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email and password are required')

    def test_register_without_name(self):
        """5. Test successful registration without providing a name."""
        data = {'email': 'noname@example.com', 'password': 'password123'}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['email'], 'noname@example.com')
        # The name should default to the username (which is the email)
        self.assertEqual(response.data['user']['name'], 'noname@example.com')

    # --- Login Tests (login_view) ---

    def test_login_success(self):
        """6. Test successful login with correct credentials."""
        data = {'email': self.user_data['email'], 'password': self.user_data['password']}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['id'], self.user.id)

    def test_login_invalid_password(self):
        """7. Test login with an invalid password."""
        data = {'email': self.user_data['email'], 'password': 'wrongpassword'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'Invalid credentials')

    def test_login_nonexistent_user(self):
        """8. Test login with a non-existent email."""
        data = {'email': 'nouser@example.com', 'password': 'somepassword'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'Invalid credentials')

    def test_login_missing_email(self):
        """9. Test login with a missing email."""
        data = {'password': self.user_data['password']}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email and password are required')

    def test_login_missing_password(self):
        """10. Test login with a missing password."""
        data = {'email': self.user_data['email']}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email and password are required')

    # --- Logout Tests (logout_view) ---

    def test_logout_success(self):
        """11. Test successful logout for an authenticated user."""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Successfully logged out')
        # Verify the token is deleted
        # we need this to make sure that the token isnt just reused a bunch
        with self.assertRaises(Token.DoesNotExist):
            Token.objects.get(user=self.user)

    def test_logout_unauthenticated(self):
        """12. Test logout attempt by an unauthenticated user."""
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout_twice(self):
        """13. Test that a second logout attempt fails as user is no longer authenticated."""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        first_response = self.client.post(self.logout_url)
        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.client.credentials()
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --- User Profile Tests (user_profile) ---

    def test_get_user_profile_success(self):
        """14. Test retrieving the user profile for an authenticated user."""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['id'], self.user.id)
        self.assertEqual(response.data['user']['email'], self.user.email)
        self.assertEqual(response.data['user']['name'], self.user.first_name)

    def test_get_user_profile_unauthenticated(self):
        """15. Test retrieving user profile by an unauthenticated user."""
        response = self.client.get(self.profile_url)
        #  permission denies anonymous users with a 403.
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)