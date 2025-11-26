const deleteButton = document.querySelectorAll('.delete-button');
const changeButton = document.querySelectorAll('.change-button');

deleteButton.forEach(button,()=>{
    button.addEventListener('click',function(){
        console.log('!');
    })
})