import React from 'react'
import Slider from '../pages/home/Slider'

import Items from '../pages/home/Items';
import Features from '../pages/home/Features';
import Newsletter from '../pages/home/Newsletter';
import PromotionSectionContent from '../component/PromotionPage';


function Home(props) {
    return (
        <div className="container">
            <Slider />
            <Features />
            <PromotionSectionContent/>
            <Items />
            <Newsletter/>

        </div>
    );
}

export default Home;