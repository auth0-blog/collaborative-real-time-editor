const textSyncInstance = new TextSync({
  instanceLocator: "v1:us1:d0b374a9-1028-4b37-af35-01526c549c7b"
});

//Creates an instance of the TextSync editor
const editor = textSyncInstance.createEditor({
  docId: document.URL.slice(document.URL.lastIndexOf("/") + 1),
  element: "#text_editor",
  authEndpoint: "http://localhost:3000/textsync/tokens",
  userName: user,
  cursorLabelsAlwaysOn: true,

  onCollaboratorsJoined: users => {
    const activeUsers = document.querySelector(".active_users ul");
    users.forEach(value => {
      activeUsers.insertAdjacentHTML(
        "beforeend",
        `<li id='${value.siteId}'>${value.name}</li>`
      );
    });
  },

  onCollaboratorsLeft: users => {
    const activeUsers = document.querySelectorAll(".active_users ul li");
    users.forEach(value => {
      activeUsers.forEach(element => {
        if (element.id === value.siteId) element.remove();
      });
    });
  }
});
