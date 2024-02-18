function generate_mix_list() {
    fetch('../../mix/mix_list.json')
        .then(response => response.json())
        .then(data => {

            let root = document.querySelector('div.mix_list');

            data.forEach(function (mix) {

                let mix_title = document.createElement("h3");
                mix_title.textContent = mix.title;
                root.appendChild(mix_title);

                let mix_table = document.createElement("table");
                root.appendChild(mix_table);

                let mix_text_list = document.createElement("tr");
                mix_table.appendChild(mix_text_list);

                mix.text_list.forEach(function (text, index) {

                    let mix_test_td = document.createElement("td");
                    mix_text_list.appendChild(mix_test_td);

                    let mix_text_details = document.createElement("details");
                    if (index === 0) {
                        mix_text_details.setAttribute("open", "");
                    }
                    mix_text_details.className = "has_copy_button";
                    mix_test_td.appendChild(mix_text_details);

                    let mix_text_lang = document.createElement("summary");
                    mix_text_lang.textContent = text.lang;
                    mix_text_details.appendChild(mix_text_lang);

                    add_copy_button(mix_text_details, mix_text_lang);

                    let mix_text_content = document.createElement("span");
                    mix_text_content.className = "white_space_pre";
                    mix_text_content.textContent = text.text;
                    mix_text_details.appendChild(mix_text_content);

                    if (text.hasOwnProperty("notes") && text.notes !== "") {

                        let mix_text_notes_div = document.createElement("div");
                        mix_text_notes_div.className = "admonition info";
                        mix_text_content.appendChild(mix_text_notes_div);

                        let mix_text_notes_title = document.createElement("p");
                        mix_text_notes_title.className = "admonition-title";
                        mix_text_notes_title.textContent = "备注";
                        mix_text_notes_div.appendChild(mix_text_notes_title);

                        let mix_text_notes_content = document.createElement("p");
                        mix_text_notes_content.textContent = text.notes;
                        mix_text_notes_content.className="white_space_pre_line";
                        mix_text_notes_div.appendChild(mix_text_notes_content);
                    }
                })
                if ((mix.link_list.length > 0 || mix.notes !== "")) {

                    let mix_reference_tr = document.createElement("tr");
                    mix_table.appendChild(mix_reference_tr);

                    let mix_reference_td = document.createElement("td");
                    mix_reference_td.setAttribute("colspan", mix.text_list.length.toString());
                    mix_reference_tr.appendChild(mix_reference_td);

                    if (mix.hasOwnProperty("notes") && mix.notes !== "") {

                        let mix_note_div = document.createElement("div");
                        mix_note_div.className = "admonition info mix_reference";
                        mix_reference_td.appendChild(mix_note_div);

                        let mix_note_title = document.createElement("p");
                        mix_note_title.className = "admonition-title";
                        mix_note_title.textContent = "备注";
                        mix_note_div.appendChild(mix_note_title);

                        let mix_note_content = document.createElement("span");
                        mix_note_content.textContent = mix.notes;
                        mix_note_content.className = "mix_reference_span";
                        mix_note_div.appendChild(mix_note_content);
                    }

                    if (mix.hasOwnProperty("link_list") && mix.link_list.length > 0) {

                        let mix_link_details = document.createElement("details");
                        mix_link_details.className = "mix_reference";
                        mix_reference_td.appendChild(mix_link_details);

                        let mix_link_summary = document.createElement("summary");
                        mix_link_summary.textContent = "参考资料";
                        mix_link_details.appendChild(mix_link_summary);

                        let mix_link_list = document.createElement("span");
                        mix_link_list.className = "mix_reference_span";
                        mix_link_details.appendChild(mix_link_list);

                        mix.link_list.forEach(function (link) {
                            let mix_link_content = document.createElement("a");
                            mix_link_content.href = link.url;
                            mix_link_content.textContent = link.title + "\n";
                            mix_link_content.className = "mix_link";
                            mix_link_list.appendChild(mix_link_content);
                        })
                    }
                }
            })
        })
        .catch(function () {
            console.log("error")
        });
}

function add_copy_button(detail, summary) {

    let copy_button = document.createElement('Button');
    if (detail.open) {
        copy_button.className = 'copy_button display_inline';
    } else {
        copy_button.className = 'copy_button display_none';
    }
    copy_button.textContent = '复制';
    summary.appendChild(copy_button);

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
}