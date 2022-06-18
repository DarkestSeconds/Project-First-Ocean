
$('#search').submit((event) => {
    event.preventDefault()




    window.location.href = `/perfil/${$('#searchUser').val()}`
})