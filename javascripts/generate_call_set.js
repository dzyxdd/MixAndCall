function generate_call_set() {
    const params = new URLSearchParams(window.location.search);
    const param = params.get('name');

    fetch('../../../call本/call_set/call_set.json')
        .then(response => response.json())
        .then(datas => {
            const data = datas.find(element => element.title === param);
            console.log(data);

            let root = document.querySelector('div.call_set');
            console.log(root);

            data.type_list.forEach(function (type, index) {

                if (index !== 0) {
                    let hr = document.createElement("hr");
                    hr.className = "hr-shadow";
                    root.appendChild(hr);
                }

                let type_title = document.createElement("h2");
                type_title.textContent = type.title;
                root.appendChild(type_title);

                if (type.pic_list.length > 0) {

                    let type_pic_div = document.createElement("div");
                    type_pic_div.className = "Thumbnail";
                    type_pic_div.setAttribute("markdown", "1");
                    root.appendChild(type_pic_div);

                    type.pic_list.forEach(function (pic) {
                        let pic_figure = document.createElement("figure");
                        pic_figure.setAttribute("markdown", "");
                        pic_figure.className = "call_pic";
                        type_pic_div.appendChild(pic_figure);

                        let pic_p = document.createElement("p");
                        pic_figure.appendChild(pic_p);

                        let pic_a = document.createElement("a");
                        pic_a.href = pic.href;
                        pic_a.className = "glightbox";
                        pic_a.setAttribute("data-gallery", `version ${index + 1}`);
                        pic_p.appendChild(pic_a);

                        let pic_img = document.createElement("img");
                        pic_img.src = pic.href;
                        pic_img.alt = pic.description;
                        pic_img.setAttribute("object-fit", "contain");
                        pic_img.setAttribute("data-gallery", `version ${index + 1}`);
                        pic_a.appendChild(pic_img);

                        let pic_figcaption = document.createElement("figcaption");
                        pic_figcaption.textContent = pic.description;
                        pic_figcaption.className="call_pic_caption";
                        pic_figure.appendChild(pic_figcaption);

                        pic_figure.style.marginBottom = `${pic_figcaption.offsetHeight}px`;
                    })
                }
            })
        })
        .catch(error => console.error('Error:', error));
}