import React from "react";
import Plotly from "react-plotly.js";
import { LayoutAxis } from "plotly.js";
import { PlotSettings, Spectrum } from "../constants";
import { addSubscriptsToMolecule } from "../modules/molecule-subscripts";
import { Species } from "./types";

export interface PlotProps {
  spectra: Spectrum[];
  plotSettings: PlotSettings;
}

const plotColors = [
  "#f50057",
  "#3f51b5",
  "#00bcd4",
  "#ffeb3b",
  "#ff9800",
  "#9c27b0",
  "#2196f3",
  "#009688",
  "#ff5722",
  "#795548",
  "#607d8b",
  "#e91e63",
  "#673ab7",
];

export const Plot_: React.FC<PlotProps> = ({
  spectra,
  plotSettings: { mode, units },
}) => {
  let modeLabel = "";
  if (mode === "absorbance") {
    modeLabel = "Absorbance";
  } else if (mode.startsWith("transmittance")) {
    modeLabel = "Transmittance";
  } else if (mode.startsWith("radiance")) {
    modeLabel = "Radiance";
  }

  const yaxis: Partial<LayoutAxis> = {
    title: {
      text: `${modeLabel}${units.length ? " (" + units + ")" : ""}`,
    },
    type: "linear",
    autorange: true,
    fixedrange: false,
  };

  //buttons to switch between log scale and linear scale
  const updatemenus = [
    {
      type: "buttons",
      x: 0,
      y: -0.37,
      xanchor: "left",
      yanchor: "top",
      pad: { r: 10, t: 10 },
      direction: "left",
      showactive: true,
      buttons: [
        {
          label: "Linear Scale",
          //passing title to every scale
          args: [
            {
              yaxis: {
                ...yaxis,
                type: "linear",
              },
            },
          ],
          method: "relayout",
        },
        {
          label: "Log Scale",
          args: [
            {
              yaxis: {
                ...yaxis,
                type: "log",
              },
            },
          ],
          method: "relayout",
        },
      ],
    },
  ];

  const formatSpectrumName = ({
    database,
    tgas,
    trot,
    tvib,
    pressure,
    species,
  }: {
    database: string;
    tgas: number;
    trot?: number;
    tvib?: number;
    pressure: number;
    species: Species[];
  }) => {
    const speciesFormatted = species
      .map(
        ({ molecule, mole_fraction }) =>
          `${addSubscriptsToMolecule(molecule)} (χ=${mole_fraction})`
      )
      .join(", ");
    let formatted = `${speciesFormatted} ${database.toUpperCase()}, Pressure=${pressure} bar, Tgas=${tgas} K`;
    if (trot) {
      formatted += `, Trot=${trot} K, Tvib=${tvib} K`;
    }
    return formatted;
  };

  return (
    <Plotly
      className="Plot"
      data={spectra.map(
        ({ x, y, species, database, tgas, trot, tvib, pressure }, index) => ({
          x,
          y,
          type: "scatter",
          marker: { color: plotColors[index % plotColors.length] },
          name: formatSpectrumName({
            database,
            species,
            tgas,
            trot,
            tvib,
            pressure,
          }),
        })
      )}
      layout={{
        width: 800,
        height: 600,
        title: spectra.length === 1 ? "Spectrum" : "Spectra",
        font: { family: "Roboto", color: "#000" },
        xaxis: {
          autorange: true,
          title: { text: "Wavenumber (cm⁻¹)" },
          rangeslider: {
            // TODO: Update typing in DefinitelyTyped
            // @ts-ignore
            autorange: true,
            // @ts-ignore
            yaxis: { rangemode: "auto" },
          },
          type: "linear",
        },
        yaxis,
        updatemenus,
        showlegend: true,
        legend: { orientation: "h", y: -0.6, x: 0 },
      }}
    />
  );
};

export const Plot = React.memo(Plot_);
