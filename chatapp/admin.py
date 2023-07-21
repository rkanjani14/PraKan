from django.contrib import admin
from chatapp.models import Thread, ChatMessage
from django import forms
from django.core.exceptions import ValidationError
from django.db.models import Q
# Register your models here.

# class ChatMessage(admin.TabularInline):
#     model = ChatMessage

class ThreadForm(forms.ModelForm):
    def clean(self):
        super(ThreadForm,self).clean()
        first_person = self.cleaned_data.get('first_person')
        second_person = self.cleaned_data.get('second_person')
        lookup1 = Q(first_person=first_person) & Q(second_person=second_person)
        lookup2 = Q(first_person=second_person) & Q(second_person=first_person)
        lookup = Q(lookup1 | lookup2)
        qs = Thread.objects.filter(lookup)
        if qs.exists():
            raise ValidationError(f'Thread between {first_person} and {second_person} already exists')


@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    inline = [ChatMessage]
    form = ThreadForm
    list_display = ('id', 'first_person', 'second_person', 'updated', 'timestamp')
    class Meta:
        model = Thread

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'thread', 'user', 'message' , 'timestamp')
