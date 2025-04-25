import React from 'react';
import { Carousel } from 'react-bootstrap';
import slide1 from '../../assets/images/banners/slide1.jpg';
import slide2 from '../../assets/images/banners/slide2.jpg';
import slide3 from '../../assets/images/banners/slide3.jpg';
import './Slide.css'; // <- Thêm CSS

const Slider = () => {
    return (
        <section className="section-main padding-y">
            <Carousel fade interval={3000} controls indicators>
                <Carousel.Item>
                    <img className="d-block w-100 slider-image" src={slide1} alt="First slide" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100 slider-image" src={slide2} alt="Second slide" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100 slider-image" src={slide3} alt="Third slide" />
                </Carousel.Item>
            </Carousel>
        </section>
    );
};

export default Slider;
