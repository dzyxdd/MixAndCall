let links = document.querySelectorAll('a.call_pic');
links.forEach(function (link) {
    console.log(link.href);
    link.addEventListener('click', function (event) {
        event.preventDefault();
        var details=link.parentNode;
        details.style.width='100%';
    });
});