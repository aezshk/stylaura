from django.db import models
from django.contrib.auth.models import User


# ================= SKIN =================
class SkinProfile(models.Model):

    SKIN_TYPES = [
        ('oily', 'Oily'),
        ('dry', 'Dry'),
        ('combination', 'Combination'),
        ('normal', 'Normal'),
        ('sensitive', 'Sensitive'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    redness = models.IntegerField(default=0)

    texture = models.IntegerField(default=0)

    dark_spots = models.IntegerField(default=0)

    skin_type = models.CharField(
        max_length=20,
        choices=SKIN_TYPES
    )

    concerns = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.skin_type


# ================= HAIR =================
class HairProfile(models.Model):

    HAIR_TYPES = [
        ('straight', 'Straight'),
        ('wavy', 'Wavy'),
        ('curly', 'Curly'),
        ('coily', 'Coily'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    hair_type = models.CharField(
        max_length=20,
        choices=HAIR_TYPES
    )

    concerns = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.hair_type


# ================= USER PROFILE =================
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    mobile = models.CharField(max_length=15)
    gender = models.CharField(max_length=10)
    age = models.IntegerField()

    role = models.CharField(
        max_length=20,
        choices=[('admin','Admin'), ('user','User')],
        default='user'
    )

    def __str__(self):
        return self.user.username


# ================= COLOUR =================
class ColourProfile(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    undertone = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.undertone


# ================= PRODUCT =================
class Product(models.Model):

    TIER_CHOICES = [
        ('budget', 'Budget'),
        ('medium', 'Medium'),
        ('luxury', 'Luxury'),
    ]

    PRODUCT_TYPE_CHOICES = [
        ('skin', 'Skin'),
        ('hair', 'Hair'),
        ('colour', 'Colour'),
    ]

    name = models.CharField(max_length=200)

    brand = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    category = models.CharField(max_length=100)

    tier = models.CharField(
        max_length=10,
        choices=TIER_CHOICES
    )

    product_type = models.CharField(
        max_length=10,
        choices=PRODUCT_TYPE_CHOICES
    )

    price = models.IntegerField()

    image = models.URLField(blank=True)

    description = models.TextField(blank=True)

    rating = models.FloatField(default=4.0)

    def __str__(self):
        return self.name


# ================= CART =================
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
    
from django.contrib.auth.models import User

class Order(models.Model):
    PAYMENT_CHOICES = [
        ('ONLINE', 'Online'),
        ('COD', 'Cash on Delivery'),
    ]


    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)   
    total_amount = models.IntegerField()
    payment_id = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    name = models.CharField(max_length=100, default="NA")
    mobile = models.CharField(max_length=15, default="NA")
    address = models.TextField(default="NA")

    total_amount = models.IntegerField()
    payment_id = models.CharField(max_length=200)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def __str__(self):
        return self.product.name
    
def save(self, *args, **kwargs):

    if not self.image:
        name = self.name.lower()

        if "shampoo" in name:
            self.image = "https://m.media-amazon.com/images/I/61IMRs+o0iL._SL1500_.jpg"

        elif "conditioner" in name:
            self.image = "https://m.media-amazon.com/images/I/61uYp9Z3ZCL._SL1500_.jpg"

        elif "serum" in name:
            self.image = "https://m.media-amazon.com/images/I/61z8x5R7QAL._SL1500_.jpg"

        elif "oil" in name:
            self.image = "https://m.media-amazon.com/images/I/71K8uZ6Bz7L._SL1500_.jpg"

        elif "mask" in name:
            self.image = "https://m.media-amazon.com/images/I/71h3VVH5ZRL._SL1500_.jpg"

        elif "cleanser" in name:
            self.image = "https://m.media-amazon.com/images/I/71f7vX4xFjL._SL1500_.jpg"

        elif "moisturizer" in name:
            self.image = "https://m.media-amazon.com/images/I/71cX9c0l5zL._SL1500_.jpg"

        elif "sunscreen" in name:
            self.image = "https://m.media-amazon.com/images/I/61kqY6VfZKL._SL1500_.jpg"

        else:
            self.image = "https://via.placeholder.com/300"

    super().save(*args, **kwargs)