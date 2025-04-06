import React, { useEffect, useMemo, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Autocomplete from "@mui/joy/Autocomplete";
import { Control, FieldError } from "react-hook-form";
import {
  addSubscriptsToMolecule,
  removeSubscriptsFromMolecule,
} from "../../../modules/molecule-subscripts";
import "./index.css";
import { Database, FormValues } from "../../types";
import {
  moleculeOptionsEquimolecules,
  moleculeOptionsNonequimolecules,
  moleculeOptionsGesia,
  moleculeOptionsHitemp,
} from "./molecules";

interface MoleculeSelectorProps {
  validationError?: FieldError;
  onChange: (value: string) => void;
  value: string;
  control: Control<FormValues>;
  autofocus?: boolean;
  isNonEquilibrium: boolean;
  databaseWatch: Database;
}

const databaseMoleculeMap: Record<Database, string[]> = {
  [Database.GEISA]: moleculeOptionsGesia,
  [Database.HITEMP]: moleculeOptionsHitemp,
};

export const MoleculeSelector: React.FC<MoleculeSelectorProps> = ({
  validationError,
  onChange,
  value,
  autofocus = false,
  isNonEquilibrium,
  databaseWatch,
}) => {
  const [input, setInput] = useState("");

  // Memoize molecule options based on dependencies
  const moleculeOptions = useMemo(() => {
    if (isNonEquilibrium) {
      return moleculeOptionsNonequimolecules;
    }
    return databaseMoleculeMap[databaseWatch] || moleculeOptionsEquimolecules;
  }, [isNonEquilibrium, databaseWatch]);

  // Memoize formatted options to avoid recalculating on every render
  const formattedOptions = useMemo(
    () => moleculeOptions.map(addSubscriptsToMolecule),
    [moleculeOptions]
  );

  const currentValue = useMemo(
    () => addSubscriptsToMolecule(value || ""),
    [value]
  );

  const handleInputChange = (
    _: React.SyntheticEvent<Element, Event>,
    newInput: string
  ) => {
    setInput(addSubscriptsToMolecule(newInput.toUpperCase()));
  };

  const handleChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string | null
  ) => {
    onChange(value ? removeSubscriptsFromMolecule(value) : "");
  };

  return (
    <FormControl>
      <FormLabel>Molecule</FormLabel>
      <Autocomplete
        id="molecule-selector"
        variant="outlined"
        options={formattedOptions}
        error={!!validationError}
        autoFocus={autofocus}
        value={currentValue}
        inputValue={input}
        onInputChange={handleInputChange}
        renderOption={(props, option) => (
          <li {...props}>{addSubscriptsToMolecule(option)}</li>
        )}
        onChange={handleChange}
        sx={{
          width: "100%",
          "& .MuiAutocomplete-input": {
            textTransform: "none", // Prevent automatic capitalization
          },
        }}
      />
    </FormControl>
  );
};