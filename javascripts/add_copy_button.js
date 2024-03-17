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
    let liElements = document.querySelectorAll('.common_length');
    let divElements = document.querySelectorAll('div.mix');
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
                return;
            }
            // 获取被点击的li元素的length类
            let lengthClass = Array.from(li.classList).find(cls => cls.startsWith('length'));
            // 遍历所有的div元素
            divElements.forEach(function (div) {
                // 获取当前div元素的前一个兄弟元素
                let previousH4 = div.previousElementSibling;

                // 如果div元素具有length类，显示它和它的h4
                if (div.classList.contains(lengthClass)) {
                    div.style.display = 'block';
                    if (previousH4) previousH4.style.display = 'block';
                }
                // 否则，隐藏它和它的h4
                else {
                    div.style.display = 'none';
                    if (previousH4) previousH4.style.display = 'none';
                }
            });
        });
    });

    let aElements = document.querySelectorAll('a');
    // 为每个a元素添加点击事件处理器
    aElements.forEach(function (a) {
        // 检查a元素的href属性是否包含'/mix/mix/'
        if (a.href.includes('/mix/mix')) {
            a.addEventListener('click', function () {

                // 遍历所有的div元素
                divElements.forEach(function (div) {
                    // 获取当前div元素的前一个兄弟元素
                    let previousH4 = div.previousElementSibling;

                    // 显示div元素和它的h4
                    div.style.display = 'block';
                    if (previousH4) previousH4.style.display = 'block';
                });
            });
        }
    });
})