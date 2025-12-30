from django.urls import path
from .views import ThreadListCreateView, ThreadDetailView, ThreadPostsView, ThreadSummarizeView, PostDetailView

urlpatterns = [
    path('api/threads/', ThreadListCreateView.as_view(), name='thread-list-create'),
    path('api/threads/<int:pk>/', ThreadDetailView.as_view(), name='thread-detail'),
    path('api/threads/<int:pk>/posts/', ThreadPostsView.as_view(), name='thread-posts'),
    path('api/threads/<int:pk>/summarize/', ThreadSummarizeView.as_view(), name='thread-summarize'),
    path('api/posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]
