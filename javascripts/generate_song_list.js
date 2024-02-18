function generate_list() {
    fetch('../../call本/stage_list.json')
        .then(response => response.json())
        .then(data => {

            let root = document.querySelector('div.song_list');

            data.forEach(function (stage) {

                let stage_details = document.createElement("details");
                root.appendChild(stage_details);

                let stage_summary = document.createElement("summary");
                stage_details.appendChild(stage_summary);

                let stage_title = document.createElement("div");
                stage_title.className = "stage_title";
                stage_title.textContent = stage.title;
                stage_summary.appendChild(stage_title);

                let stage_attr_labels = document.createElement("ul");
                stage_attr_labels.className = "stage_attr_label_list";
                stage_summary.appendChild(stage_attr_labels);

                let add_attr_label = function (stage_attr_labels, attr_name) {

                    if (attr_name === "") return;
                    let li = document.createElement("li");
                    li.className = "stage_attr";
                    li.textContent = attr_name;
                    stage_attr_labels.appendChild(li);
                }

                if (stage.hasOwnProperty('type'))
                    add_attr_label(stage_attr_labels, stage.type);
                if (stage.hasOwnProperty('time'))
                    add_attr_label(stage_attr_labels, stage.time);
                if (stage.hasOwnProperty('team'))
                    add_attr_label(stage_attr_labels, stage.team);


                if (stage.hasOwnProperty('notes') && stage.notes !== "") {

                    let stage_notes_div = document.createElement("div");
                    stage_notes_div.className = "admonition info";
                    stage_details.appendChild(stage_notes_div);

                    let stage_notes_title = document.createElement("p");
                    stage_notes_title.className = "admonition-title";
                    stage_notes_title.textContent = "其他队伍复刻情况";
                    stage_notes_div.appendChild(stage_notes_title);

                    let stage_notes_content = document.createElement("p");
                    stage_notes_content.textContent = stage.notes;
                    stage_notes_div.appendChild(stage_notes_content);
                }

                let stage_song_title_list = document.createElement("ul");
                stage_details.appendChild(stage_song_title_list);

                stage.song_title_list.forEach(function (song_title) {

                    let li = document.createElement("li");
                    li.className = "song_title";
                    stage_song_title_list.appendChild(li);


                    let stage_song_href = document.createElement("a");
                    stage_song_href.textContent = song_title;
                    li.appendChild(stage_song_href);

                    let href_text = "../call_set/call_set/?name="+encodeURIComponent(song_title);
                    console.log(href_text);
                    fetch("../call_set/song_list.json")
                        .then(response => response.json())
                        .then(data => {
                            if (data.includes(song_title)) {
                                stage_song_href.style.color = 'blue';
                                stage_song_href.href = href_text;
                            } else {
                                stage_song_href.style.color = 'red';
                                stage_song_href.href = "javascript:void(0)";
                            }
                        })
                        .catch(() => {
                            stage_song_href.style.color = 'red';
                            stage_song_href.href = "javascript:void(0)";
                        });
                })
            })
        })
        .catch(function (error) {
            console.log('Request failed', error);
        });
}
