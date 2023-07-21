from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.exceptions import StopConsumer
from asgiref.sync import async_to_sync
from allauth.socialaccount.models import SocialAccount
from channels.layers import get_channel_layer
channel_layer = get_channel_layer()
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
User = get_user_model()
from .models import *
from django.db.models import Q
import json
import time

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.chat_room = f'user_chatroom_{self.user.id}'
        await self.channel_layer.group_add(self.chat_room, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        received_data = json.loads(text_data)
        message = received_data.get('message')
        sent_by_id = received_data.get('sent_by')
        send_by_id = received_data.get('send_to')
        chat_id = received_data.get('chat_id')
        sent_by_user = await self.get_user_object(sent_by_id)
        send_to_user = await self.get_user_object(send_by_id)
        other_user_chat_room = f'user_chatroom_{send_to_user.id}'

        # Thread Obj
        thread_obj = await self.get_thread_object(sent_by_user ,send_to_user)
        # chatMessage Obj
        await self.save_chatmessage(thread_obj,sent_by_user,message)
        receiver_user_avatar = await self.get_avatar(sent_by_user)
        response = {
            'message':message,
            'sent_by':self.user.id,
            'chat_id':chat_id,
            'receiver_user_avatar':receiver_user_avatar
        }

        # sending message to another user chatroom
        await self.channel_layer.group_send(other_user_chat_room,{
            'type':'chat_message',
            'response':json.dumps(response)
        })

        # sending message to self user chatroom
        await self.channel_layer.group_send(self.chat_room,{
            'type':'chat_message',
            'response':json.dumps(response)
        })

    async def chat_message(self,event):
        response = event.get('response')
        await self.send(response)

    async def disconnect(self ,*args , **kwargs):
        print('disconnected...')

    @database_sync_to_async
    def get_user_object(self, user_id):
        qs = User.objects.filter(id=user_id)
        if qs.exists():
            obj = qs.first()
        else:
            obj = none
        return obj

    @database_sync_to_async
    def get_thread_object(self, first_user, second_user):
        lookup1 = Q(first_person = first_user) & Q(second_person = second_user)
        lookup2 = Q(first_person = second_user) & Q(second_person = first_user)
        thread_obj = Thread.objects.filter(Q(lookup1) | Q(lookup2))
        if thread_obj.exists():
            thread_obj = thread_obj.first()
        else:
            thread_obj = none
        return thread_obj

    @database_sync_to_async
    def save_chatmessage(self, thread_obj, sent_by_user, message):
        ChatMessage.objects.create(thread=thread_obj,user=sent_by_user,message=message)
        return True

    @database_sync_to_async
    def get_avatar(self,user_obj):
        extra_data = SocialAccount.objects.get(user=user_obj).extra_data
        user_avatar = extra_data['picture']
        return user_avatar