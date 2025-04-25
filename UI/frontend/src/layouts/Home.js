import React from 'react'
import Slider from '../pages/home/Slider'
import Deal from '../pages/home/Deal';

import ApparelPage from '../pages/home/Apparel';
import Electronics from '../pages/home/Electronics';
import Request from '../pages/home/Request';
import Items from '../pages/home/Items';
import Services from '../pages/home/Services';
import Region from '../pages/home/Region';
import Subscribe from '../pages/home/Subscribe';
import Chat from '../pages/home/Chat';
import Section1 from '../pages/home/Section1';

function Home(props) {
    return (
        <div className="container">
            <Slider />
            <Items />

        </div>
    );
}

export default Home;