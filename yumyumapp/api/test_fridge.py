from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from django.urls import reverse


class FridgeAPITestCase(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='testpassword', email='test@example.com')
        # Get a token for the user
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_view_fridge(self):
        """
        Ensure we can view the fridge contents.
        """
        url = reverse('fridge')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, 200)

    def test_add_fridge_item(self):
        """
        Ensure we can add an item to the fridge.
        """
        url = reverse('add_fridge_item')
        data = {'name': 'Milk', 'quantity': 2}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['name'], 'Milk')

    def test_remove_fridge_item(self):
        """
        Ensure we can remove an item from the fridge.
        """
        # First, add an item
        add_url = reverse('add_fridge_item')
        data = {'name': 'Cheese', 'quantity': 1}
        response = self.client.post(add_url, data, format='json')
        item_id = response.data['id']

        # Now, remove it
        remove_url = reverse('remove_fridge_item', kwargs={'item_id': item_id})
        response = self.client.delete(remove_url)
        self.assertEqual(response.status_code, 204)

    def test_clear_fridge(self):
        """
        Ensure we can clear the fridge.
        """
        # First, add some items
        add_url = reverse('add_fridge_item')
        self.client.post(add_url, {'name': 'Eggs', 'quantity': 12}, format='json')
        self.client.post(add_url, {'name': 'Bread', 'quantity': 1}, format='json')

        # Now, clear the fridge
        clear_url = reverse('clear_fridge')
        response = self.client.delete(clear_url)
        self.assertEqual(response.status_code, 200)

        # Check that the fridge is empty
        view_url = reverse('fridge')
        response = self.client.get(view_url, format='json')
        self.assertEqual(len(response.data['items']), 0)
