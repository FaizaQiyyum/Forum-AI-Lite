from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Thread, Post
from .serializers import ThreadSerializer, PostSerializer
from .utils import generate_summary

class ThreadListCreateView(generics.ListCreateAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer

class ThreadDetailView(generics.RetrieveDestroyAPIView):
    queryset = Thread.objects.all()
    serializer_class = ThreadSerializer

class PostDetailView(generics.RetrieveDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class ThreadPostsView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        thread_id = self.kwargs['pk']
        return Post.objects.filter(thread_id=thread_id)

    def perform_create(self, serializer):
        thread = get_object_or_404(Thread, pk=self.kwargs['pk'])
        serializer.save(thread=thread)

class ThreadSummarizeView(APIView):
    def post(self, request, pk):
        print(f"DEBUG: Processing summary request for thread {pk}", flush=True)
        thread = get_object_or_404(Thread, pk=pk)
        
        # Get all content from posts
        posts = thread.posts.all()
        full_text = " ".join([p.content for p in posts])
        
        summary = generate_summary(full_text, thread_id=pk)
        thread.summary = summary
        thread.save()
        
        return Response({"summary": summary}, status=status.HTTP_200_OK)
