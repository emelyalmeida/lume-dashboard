export const img = n => `/products/${n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;
export const Thumb = ({ n, big }) => <img className={big ? "pic" : "th"} src={img(n)} alt="" onError={e => (e.target.style.visibility = "hidden")} />;
