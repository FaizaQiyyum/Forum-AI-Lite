from rest_framework import serializers
from .models import Thread, Post
from textblob import TextBlob

class PostSerializer(serializers.ModelSerializer):
    sentiment = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'thread', 'content', 'author_name', 'created_at', 'sentiment']
        read_only_fields = ['id', 'thread', 'created_at', 'sentiment']

    def get_sentiment(self, obj):
        analysis = TextBlob(obj.content)
        polarity = analysis.sentiment.polarity
        if polarity > 0.1:
            return "Positive"
        elif polarity < -0.1:
            return "Critical"
        else:
            return "Neutral"

class ThreadSerializer(serializers.ModelSerializer):
    preview = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ['id', 'title', 'summary', 'created_at', 'preview']
        read_only_fields = ['id', 'created_at', 'summary']

    def get_preview(self, obj):
        first_post = obj.posts.order_by('created_at').first()
        if first_post:
            return first_post.content[:100] + "..." if len(first_post.content) > 100 else first_post.content
        return "No posts yet."
