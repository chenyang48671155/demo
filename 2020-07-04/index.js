async function getData() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await response.json();

  console.log(posts);

  const root = document.querySelector("#root");
  const ul = document.createElement("ul");

  posts.forEach((post) => {
    const li = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.appendChild(document.createTextNode(post.title));
    anchor.setAttribute(
      "href",
      `https://jsonplaceholder.typicode.com/posts/${post.id}`
    );

    li.appendChild(anchor);

    ul.appendChild(li);
  });

  root.appendChild(ul);
}

getData();
