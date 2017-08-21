import React from 'react';

import { Scatter as ScatterChart } from 'react-chartjs-2';

import './css/Metric.css';


export default props => {
    return (
        <div className="metric">
            <h3 className="metric-name">{props.name}</h3>
            <ScatterChart
                data={props.data}
                height={250}
                width={350}
                options={{
                    maintainAspectRatio: false,
                    responsive: false,
                }}
            />
        </div>
    );
};
