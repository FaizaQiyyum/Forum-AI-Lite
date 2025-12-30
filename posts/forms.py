from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Enter post title...'}),
            'content': forms.Textarea(attrs={'class': 'form-textarea', 'placeholder': 'Type your post content here...', 'rows': 6}),
        }
