from rest_framework import serializers
from .models import Fridge, FridgeItem

class FridgeItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the FridgeItem model.
    """
    class Meta:
        model = FridgeItem
        fields = ['id', 'name', 'quantity']


class FridgeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Fridge model, including its items.
    """
    items = FridgeItemSerializer(many=True, read_only=True)

    class Meta:
        model = Fridge
        fields = ['id', 'name', 'items']