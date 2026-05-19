import React from "react";
import { SecondaryBtn } from "./Btn";
import "./Service.scss";

const serviceData = [
  {
    text: 'Signature',
    desc: ' Dengan desain tajam dan bahan premium, kami mengangkat tampilan seragam Anda ke level profesional.',
  },
  {
    text: 'Pride',
    desc: 'Kami tuangkan semangat tim Anda ke dalam setiap desain seragam yang kami buat.',
  },
  {
    text: 'Craft',
    desc: 'Rasakan keyakinan dari setiap helai seragam, hasil dari material dan pengerjaan presisi kami.',
  },
  {
    text: 'Presence',
    desc: 'Kami ciptakan desain seragam yang berani dari warna hingga logo untuk memastikan komunitas Anda menjadi pusat perhatian.',
  },
];

const Card = ({ title, desc }) => {
  return (
    <div className="ServiceCard">
      <h3 style={{textTransform:"uppercase"}}>{title}</h3>
      <p>{desc}</p>
      {/* <SecondaryBtn text={`ABOUT ${title}`} classText={"btn-s-45"} /> */}
    </div>
  );
};

const Service = () => {
  return (
    <section className="service">
      <div className="container">
        {serviceData.map((elem, index) => (
          <Card key={index} title={elem.text} desc={elem.desc} />
        ))}
      </div>
    </section>
  );
};

export default Service;
