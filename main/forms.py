from django import forms
from .models import SkinProfile

class SkinProfileForm(forms.ModelForm):
    class Meta:
        model = SkinProfile
        fields = ['skin_type', 'concerns']
        widgets = {
            'skin_type': forms.Select(attrs={'class': 'form-control'}),
            'concerns': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Acne, oiliness, pigmentation, dullness...',
                'rows': 4
            }),
        }
        from django import forms

class FaceUploadForm(forms.Form):
    image = forms.ImageField()
    labels = {
            'skin_type': 'Select your skin type',
            'concerns': 'Describe your skin concerns'
            
        }
