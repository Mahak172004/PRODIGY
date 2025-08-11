// Navbar scroll effect
window.addEventListener('scroll',function(){
    const navbar=document.getElementById('navbar');
    if(this.window.scrollY>50){
        navbar.classList.add('scrolled');
    }else{
        navbar.classList.remove('scrolled');
    }
})