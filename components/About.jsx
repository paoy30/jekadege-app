'use client'
import React, { useState } from "react";
import "./About.scss";
import CircleIcon from "./CircleIcon";

const data = [
  {
    text: "VIDEO PRODUCTION",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    img: "https://images.unsplash.com/photo-1445052693476-5134dfe40f70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "BRANDING & IDENTITY",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "ONLINE MARKETING",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    img: "https://images.unsplash.com/photo-1601509875838-d73d9d41e5ec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "E-COMMERCE",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    img: "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=724&q=80",
  },
];

const About = () => {
  const [index, setIndex] = useState(0);
  return (
    <div className="About">
      <div className="container">
        <div className="image">
          <img src="/img/3.webp" alt="about image" />
        </div>
        <div className="text">
          <span>ABout</span>
          <div className="text-details">
            <h1 style={{ textTransform: 'uppercase' }}> Starting from an Obsession with Detail</h1>
            <p>
              Kami bukan pabrik raksasa. Kami adalah sebuah atelier yang percaya bahwa seragam adalah kanvas bagi identitas sebuah komunitas. Kami terobsesi dengan potongan yang pas, warna yang hidup, dan bahan yang nyaman. Dedikasi inilah
              yang kami tuangkan ke dalam setiap helai pakaian yang kami produksi, memastikan cerita komunitas Anda dijahit dengan sempurna.
            </p>
          </div>
        </div>
      </div>
      {/* <div className="container container-2">
        <div className="col-1">
          {data.map((elem, index) => (
            <div
              className="item"
              key={index}
              onMouseMove={() => setIndex(index)}
            >
              <div className="text-2">
                <h3>{elem.text}</h3>
                <p>{elem.desc.slice(0, 180)}</p>
              </div>
              <CircleIcon />
            </div>
          ))}
        </div>
        <div className="col-2">
          <img src={data[index].img} alt={data[index].text} />
        </div>
      </div> */}
    </div>
  );
};

export default About;
