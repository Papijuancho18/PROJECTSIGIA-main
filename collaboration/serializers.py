from rest_framework import serializers
from .models import (
    CollaborationSession, 
    CollaborationUser, 
    CollaborationChange,
    CollaborationRequest,
    CollaborationComment
)
from accounts.serializers import UserSerializer

class CollaborationUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CollaborationUser
        fields = ['id', 'user', 'role', 'joined_at', 'left_at', 'is_active']

class CollaborationChangeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CollaborationChange
        fields = ['id', 'change_type', 'change_data', 'user', 'element_id', 'position', 'created_at']

class CollaborationCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CollaborationComment
        fields = ['id', 'content', 'element_id', 'position', 'is_resolved', 'user', 'created_at', 'updated_at']

class CollaborationRequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    collaborator = UserSerializer(read_only=True)
    
    class Meta:
        model = CollaborationRequest
        fields = ['id', 'requester', 'collaborator', 'report', 'status', 'message', 'created_at', 'updated_at']

class CollaborationSessionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    users = CollaborationUserSerializer(many=True, read_only=True)
    changes = CollaborationChangeSerializer(many=True, read_only=True)
    comments = CollaborationCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = CollaborationSession
        fields = ['id', 'name', 'report', 'created_by', 'is_active', 'created_at', 'updated_at', 'users', 'changes', 'comments']
        read_only_fields = ['created_by', 'created_at']

class CollaborationSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollaborationSession
        fields = ['name', 'report']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
