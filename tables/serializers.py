from rest_framework import serializers
from .models import Table, TableData

class TableSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Table
        fields = ['id', 'name', 'description', 'columns', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class TableCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['name', 'description', 'columns']

class TableDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableData
        fields = ['id', 'table', 'row_data', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_table(self, value):
        # Ensure user can only add data to their own tables
        if value.created_by != self.context['request'].user:
            raise serializers.ValidationError("You can only add data to your own tables.")
        return value
