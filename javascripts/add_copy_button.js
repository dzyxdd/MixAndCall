document$.subscribe(function () {

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

    // 获取所有的li元素和div元素
    let liElements = document.querySelectorAll('.mix_tag');
    let divElements = document.querySelectorAll('div.mix');
    let tocLiElements = document.querySelectorAll('.md-nav__list .md-nav__item');
    document.querySelectorAll('.return_all');
    // 为每个li元素添加点击事件处理器
    liElements.forEach(function (li) {
        li.addEventListener('click', function () {
            if (li.classList.contains('return_all')) {
                divElements.forEach(function (div) {
                    div.style.display = 'block';
                    let previousH4 = div.previousElementSibling;
                    if (previousH4) previousH4.style.display = 'block';
                });
                tocLiElements.forEach(function (li) {
                    li.style.display = 'list-item';
                });
                return;
            }
            // 获取被点击的li元素的tag类
            let tagClass = Array.from(li.classList).find(cls => cls.startsWith('tag_'));
            // 遍历所有的div元素
            divElements.forEach(function (div) {
                // 获取当前div元素的前一个兄弟元素
                let previousH4 = div.previousElementSibling;

                // 如果div元素具有tag类，显示它和它的h4
                if (div.classList.contains(tagClass)) {
                    div.style.display = 'block';
                    if (previousH4) previousH4.style.display = 'block';
                }
                // 否则，隐藏它和它的h4
                else {
                    div.style.display = 'none';
                    if (previousH4) previousH4.style.display = 'none';
                }
            });
            // 遍历所有的toc li元素
            tocLiElements.forEach(function (li) {
                let linkText = li.querySelector('.md-nav__link .md-ellipsis').textContent.trim();
                let correspondingH4 = Array.from(divElements).find(div => div.previousElementSibling.textContent.trim() === linkText);
                if (correspondingH4 && correspondingH4.style.display !== 'none') {
                    li.style.display = 'list-item';
                } else {
                    li.style.display = 'none';
                }
            });
        });
    });
})