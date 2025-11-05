from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator

# --- New Fridge Model ---
class Fridge(models.Model):
    """
    Represents a specific fridge or storage unit owned by a user.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='fridge_units' # Allows access like user.fridge_units.all()
    )
    name = models.CharField(
        max_length=100,
        default='Main Fridge',
        help_text='A friendly name for the fridge (e.g., "Kitchen Fridge", "Garage Freezer").'
    )

    class Meta:
        # Ensure a user cannot have two fridges with the same name
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.user.username}'s {self.name}"

# --- Updated FridgeItem Model ---
class FridgeItem(models.Model):
    """
    Represents an item in a specific fridge, including its quantity.
    """
    # Links the item to a specific Fridge instance
    fridge = models.ForeignKey(
        Fridge,
        on_delete=models.CASCADE,
        related_name='items' # Allows access like fridge.items.all()
    )

    # The name of the item (e.g., 'Milk', 'Apples')
    name = models.CharField(max_length=255)

    # The quantity of the item (e.g., 2, 6)
    quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1, message='Quantity must be at least 1.')],
        help_text='The number or amount of this item.'
    )

    class Meta:
        # Ensures a single fridge can't have the exact same item name twice
        unique_together = ('fridge', 'name')

    def __str__(self):
        # Shows which fridge the item belongs to
        return f"{self.name} ({self.quantity}) in {self.fridge.name}"