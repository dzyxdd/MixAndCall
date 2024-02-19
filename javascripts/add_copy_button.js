let details = document.querySelectorAll('details.has_copy_button');

details.forEach(detail => {
    let copy_button = detail.querySelector('button.copy_button');
    detail.addEventListener('toggle', function () {

        if (detail.open) {
            copy_button.className = 'copy_button display_inline';
        } else {
            copy_button.className = 'copy_button display_none';
        }
    })
    copy_button.addEventListener("click", function () {

        let span = detail.querySelector('span');

        let copy_text = "";
        span.childNodes.forEach(function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                copy_text += node.textContent;
            }
        })
        navigator.clipboard.writeText(copy_text).then(function () {

            copy_button.textContent = '已复制';
            setTimeout(function () {
                copy_button.textContent = '复制';
            }, 1000);

        }).catch(err => {
            console.error('Failed to copy!', err);
        });
    })
})