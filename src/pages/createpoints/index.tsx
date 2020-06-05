import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import api, { apiIBGE } from "../../services/api";
import "./styles.css";

import logo from "../../assets/logo.svg";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IUfs {
  id?: number;
  sigla: string;
  nome?: string;
}

interface ICities {
  id: number;
  nome: string;
}

const CreatePoints = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [ufs, setUfs] = useState<IUfs[]>([]);
  const [cities, setCities] = useState<ICities[]>([]);
  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("");
  const [cordinatesCenter, setCordinatesCenter] = useState<[number, number]>([
    0,
    0,
  ]);
  const [cordinatesMarker, setCordinatesMarker] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const history = useHistory();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      return setCordinatesCenter([latitude, longitude]);
    });
  }, []);
  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);
  useEffect(() => {
    apiIBGE.get("estados?orderBy=nome").then((response) => {
      setUfs(response.data);
    });
  }, []);
  useEffect(() => {
    if (selectedUf === "0") {
      return;
    }
    apiIBGE.get(`estados/${selectedUf}/municipios`).then((response) => {
      setCities(response.data);
    });
  }, [selectedUf]);
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }
  function handleUfsChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }
  function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }
  function handleMapClick(event: LeafletMouseEvent) {
    const { lat, lng } = event.latlng;
    return setCordinatesMarker([lat, lng]);
  }
  function handleSelecteditem(id: number) {
    const alreadySelected = selectedItems.findIndex((item) => item === id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      return setSelectedItems(filteredItems);
    } else {
      return setSelectedItems([...selectedItems, id]);
    }
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = cordinatesMarker;
    const items = selectedItems;
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };
    await api.post("points", data);
    alert("Ponto de coleta salvo!");
    history.push("/");
  }
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade:</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
              value={formData.name}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
                value={formData.email}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp:</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
                value={formData.whatsapp}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>
          <Map center={cordinatesCenter} zoom={16} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {cordinatesMarker[0] !== 0 && (
              <Marker position={cordinatesMarker} />
            )}
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF):</label>
              <select
                name="uf"
                id="uf"
                onChange={handleUfsChange}
                value={selectedUf}
              >
                <option value="0">Selecione um estado</option>
                {ufs.map((uf) => (
                  <option key={uf.id} value={uf.sigla}>
                    {uf.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade:</label>
              <select
                name="city"
                id="city"
                onChange={handleCityChange}
                value={selectedCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nome}>
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens de coleta</span>
          </legend>
          <ul className="items-grid">
            {items.length > 0 ? (
              items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelecteditem(item.id)}
                  className={selectedItems.includes(item.id) ? "selected" : ""}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))
            ) : (
              <p>Não há ítens no momento.</p>
            )}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoints;
