// truncated Text which comes under the contact List of person in the form of last message
let maxLength = 35
function truncatedText(maxLength){
  let last_message = $('.last-message')
  last_message.each(function(){
    truncated = $(this).text()
    if (truncated.length > maxLength){
      truncated = truncated.substr(0,maxLength) + " ..."
      $(this).text(truncated)
    }
  })
}
truncatedText(maxLength)

// creation of csrf-token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
 }

// click on three dots and gets dropdown menus
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Click enter button & send message
$(document).on('keydown','.input-message',function(event){
  if(event.keyCode == 13){
    event.preventDefault();
    let input_group_div = $(this).parent('.input-group')
    let send_button = input_group_div.find('.send-button')
    send_button.click()
  }
})

$('#search-person').keyup(function(){
    let person_name = $(this).val()
    $('.search-contact-list').css('display','block')
    let person_list_div = $('.contact-list-person')
    person_list_div.filter(function(){
     $(this).toggle($(this).find('.person-name').text().toLowerCase().indexOf(person_name) > -1)
     })
    if(person_name.length ==0){
        $('.search-contact-list').css('display','none')
    }
})

$('#search-person').focusout(function(){
    if($(this).val().length == 0){
        $('.search-contact-list').css('display','none')
    }
})
