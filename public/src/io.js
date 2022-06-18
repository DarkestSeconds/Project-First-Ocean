const socket = io()





socket.on('err_msg', (msg) => {
    $('#msgs').prepend(`<div class="d-flex flex-row-reverse" id="liveAlertPlaceholder"><div class="alert alert-dismissible alert-dark w-25 myBgDark" role="alert"><span>${msg}</span><button type="button" class="btn-close h-5 mt-1 mx-3" data-bs-dismiss="alert" aria-label="Close"></button></div></div>`)
})

socket.on('success_msg', (msg) => {
    $('#msgs').prepend(`<div class="d-flex flex-row-reverse" id="liveAlertPlaceholder"><div class="alert alert-dismissible alert-dark w-25 myBgDark" role="alert"><span>${msg}</span><button type="button" class="btn-close h-5 mt-1 mx-3" data-bs-dismiss="alert" aria-label="Close"></button></div></div>`)
   
})