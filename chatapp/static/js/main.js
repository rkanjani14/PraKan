var menuBtn = document.getElementById('menu-btn')
var mobileMenu = document.getElementsByClassName('mobile-menu')
var iconVar = document.getElementById('icon-btn')
menuBtn.addEventListener('click',()=>{
    Array.from(mobileMenu).forEach((element) => {
        if (element.style.display === "none") {
            element.style.display = "flex";
            iconVar.classList.remove('bi-list');
            iconVar.classList.add('bi-x-lg');
        } else {
            element.style.display = "none";
            iconVar.classList.remove('bi-x-lg');
            iconVar.classList.add('bi-list');
        }
      })
});
