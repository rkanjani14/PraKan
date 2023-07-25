$(document).ready(function(){
// WebSocket creation start
let loc = window.location
webStart = 'ws://'
if(loc.protocol == 'https:'){
  webStart = 'wss://'
}
let endPoint = webStart + loc.host + "ws" + loc.pathname
let ws = new WebSocket(endPoint);
// Websocket creation end

let USER_ID = $("#logged-in-user").val()
var send_icon = $(".send-button")

ws.onopen = function(e) {
    $(document).on('click','.send-button',function(e){
            e.preventDefault()
            let input_group_div = $(this).closest('.input-group')
            let input_message = input_group_div.children('.input-message')
            let message = input_message.val().trim()
            let send_to = $(this).closest('.chat-side').attr('other-user-id').trim()
            let chat_id = $(this).closest('.chat-side').attr('chat-id').trim()
            send_to = parseInt(send_to)
            let data = {
              'message':message,
              'sent_by':USER_ID,
              'send_to':send_to,
              'chat_id':chat_id
            }
            if (data.message !== "" && data.sent_by !== "" && data.send_to !== ""){
                ws.send(JSON.stringify(data))
            }
            input_message.val("")
          }
      )
}

ws.onmessage = function(event) {
    console.log("received Message")
    response_data = JSON.parse(event.data)
    message = response_data.message
    sent_by = response_data.sent_by
    chat_id = response_data.chat_id
    receiver_user_avatar = response_data.receiver_user_avatar
    addMessage(message,sent_by,chat_id,receiver_user_avatar)
}

ws.onerror = function(event) {
    console.log('socket connection error!')
    alert('error shown...')
}

ws.onclose = function(event) {
    console.log('socket connection close!')
    alert('connection closed...')
}

function addMessage(message,sent_by,chat_id,receiver_user_avatar){
  if(USER_ID == sent_by){
    // outgoing messages
    html = $('<div class="outgoing-chats">')
                .append($('<div class="outgoing-chats-img">')
                  .append($('<img alt="">').attr("src",user_avatar))
                )
                .append($('<div class="outgoing-msg">')
                  .append($('<div class="outgoing-chats-msg">')
                    .append($('<p class="single-msg">').text(message))
                    .append($('<span class="time">7:45 PM | 07 July</span>'))
                  )
                )
  }
  else {
      html = $('<div class="received-chats">')
              .append($('<div class="received-chats-img">')
                          .append($('<img alt="">').attr("src",receiver_user_avatar))
                        )
              .append($('<div class="received-msg">')
                        .append($('<div class="received-msg-inbox">')
                                .append($('<p class="single-msg">').text(message))
                                .append($('<span class="time">6:00 PM | 07 July </span>'))
                        )
              )
    }
    let chat_side_div = $('.chat-side[chat-id="'+chat_id+'"]')
    let msg_page_div = chat_side_div.find('.msg-page')
    msg_page_div.append(html)
    msg_page_div.scrollTop(msg_page_div[0].scrollHeight);
}

// chat-div for newly created thread-id
new_chat_side = $('<div class="chat-side">')
        .append($('<div class="msg-header">')
                  .append($('<div class="container1">')
                            .append($('<img src="#" alt="" class="msgimg">'))
                            .append($('<div class="active">')
                                      .append($('<p>'))
                                    )
                            )
                )
        .append($('<div class="chat-page">')
                .append($('<div class="msg-inbox">')
                          .append($('<div class="chats">')
                                    .append($('<div class="msg-page">')))
                          .append($('<div class="msg-bottom">')
                                    .append($('<div class="input-group">')
                                                .append($('<input type="text" class="form-control input-message" placeholder="Write Message...">'))
                                                .append($('<div class="input-group-append">')
                                                        .append('<span class="input-group-text send-icon"><i class="bi bi-send send-button"></i></span>'))))))
// chat-side html block end here!

// selected chat-side from corresponding contact person by chat-id attribute and scroolbar at bottom
$('.contact-list-person').on('click',function(e){
  let chat = $(this).attr('chat-id')
  if (chat != undefined){
    $('.chat-side').css('display','none')
      let chat_side_window = $('.chat-side[chat-id="'+chat+'"]')
      chat_side_window.css('display','block')
      let msg_page = chat_side_window.find('.msg-page')
      msg_page.scrollTop(msg_page[0].scrollHeight);
  }
  else{
        let this_div = $(this)
        let other_user_id = $(this).attr('other-user-id')
        let USER_ID = $('#logged-in-user').val()
        const csrftoken = getCookie('csrftoken');
        data = {"USER_ID":USER_ID,"other_user_id":other_user_id}
        $.ajax({
          type: "POST",
          url: "/user_connection/",
          headers: {'X-CSRFToken': csrftoken},
          data: JSON.stringify(data),
          dataType: 'json',
          success: function(data){
            if(data.status === false){
                alert('Something Failed Refresh your page !!!')
            }else{
                let thread_id = data.thread_id
                let chat_id = "chat_"+thread_id

                this_div.attr("chat-id",chat_id)
                $('.chat-side').css('display','none')
                let container_div = $('.container')
                container_div.append(new_chat_side)
                let last_chat_side = $('.chat-side').last()
                last_chat_side.attr({'chat-id':chat_id,'other-user-id':other_user_id})
                last_chat_side.find('p').text(data.second_person_first_name)
                last_chat_side.find('img').attr('src',data.second_person_avatar)
                last_chat_side.css('display','block')
                send_icon = $('.send-button')
            }
          }
        });
  }
})
})
