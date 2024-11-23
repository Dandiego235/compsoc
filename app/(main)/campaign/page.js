"use client";
import { Row, Col, Button } from "react-bootstrap";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { ref, onValue } from "firebase/database";
import { Carousel } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Badge from "react-bootstrap/Badge";

export default function Campaign() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const [campaign, setCampaign] = useState(null);
  const [active, setActive] = useState(true);
  const router = useRouter();
  if (!campaignId) {
    router.push("/");
  }

  useEffect(() => {
    const campaignRef = ref(db, `campaigns/${campaignId}`);

    const unsubscribe = onValue(campaignRef, (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const value = snapshot.val();
      const datetime = new Date(value.date + "T" + "15:00:00");
      const today = new Date();
      setActive(today <= datetime);
      setCampaign(value);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <main className="container">
      <h1>Asociación Animalitos Abandonados</h1>
      {campaign ? (
        <Row>
          <Col xs={12} sm={6}>
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-center">{campaign.title}</h2>
                <Badge bg={active ? "success" : "danger"} className="mb-3">
                  {active ? "Activa" : "Terminada"}
                </Badge>
                <h3 className="card-title">Fecha</h3>
                <p className="card-text">{campaign.date}</p>
                <h3 className="card-title">Lugar</h3>
                <p className="card-text">{campaign.place}</p>
                <h3 className="card-text">Requisitos</h3>
                <ul>
                  {campaign.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
                <h3 className="card-text">Precios</h3>
                <ul>
                  {campaign.pricesData.map((price, index) => (
                    <li key={index}>
                      ₡{price.price}{" "}
                      {price.weight != "100"
                        ? `hasta ${price.weight}`
                        : `más de ${campaign.pricesData[index - 1].weight}`}{" "}
                      kg
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>
                    Cargo adicional en casos especiales de ₡
                    {campaign.priceSpecial} (preñez, celo, piometra, perros XL,
                    entre otros)
                  </strong>
                </p>
                {active && (
                  <div className="d-flex justify-content-center">
                    <Link href={`campaign/citas?id=${campaignId}`}>
                      <Button
                        variant="primary"
                        aria-label={`Agendar cita para ${campaign.title} en ${campaign.place} el día ${campaign.date}`}
                      >
                        AGENDAR CITA
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="card shadow-sm">
              <Carousel>
                {campaign.photos.map((photo) => (
                  <Carousel.Item key={photo}>
                    <img
                      className="img-fluid d-block w-100"
                      style={{
                        objectFit: "contain",
                        height: "50vh",
                        width: "auto",
                      }}
                      src={photo}
                      alt=""
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
              <Row className="card-body">
                <Col>
                  <h5 className="card-title">Disponibilidad</h5>
                  <p className="card-text">
                    Citas disponibles: {campaign.available}
                  </p>
                </Col>
                <Col>
                  <h5 className="card-title">Contacto</h5>
                  <p className="card-text">{campaign.phone}</p>
                </Col>
              </Row>
              <p className="card-body">{campaign.description}</p>
            </div>
          </Col>
        </Row>
      ) : (
        <h2>No hay una campaña. Regrese el menú principal.</h2>
      )}
    </main>
  );
}
