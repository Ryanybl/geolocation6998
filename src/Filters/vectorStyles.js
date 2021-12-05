import chroma from "chroma-js";

const vectorStyles = {
    control: styles => ({ ...styles, backgroundColor: 'white' }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        const color = data.leafletOptions?.style?.().color || 'black';
        const chromaColor = chroma(color);
        return {
            ...styles,
            backgroundColor: isDisabled
                ? null
                : isSelected
                    ? color
                    : isFocused
                        ? chromaColor.alpha(0.1).css()
                        : null,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? chroma.contrast(chromaColor, 'white') > 2
                        ? 'white'
                        : 'black'
                    : color,
            cursor: isDisabled ? 'not-allowed' : 'default',

            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled && (isSelected ? 'black' : chromaColor.alpha(0.3).css()),
            },
        };
    },
    multiValue: (styles, { data }) => {
        const color = data.leafletOptions?.style?.().color || 'black';
        const chromaColor = chroma(color);
        return {
            ...styles,
            border: chroma.contrast(chromaColor, 'white') > 2
                ? styles.border
                : '1px solid rgba(0, 0, 0, 0.3)',
            backgroundColor: chromaColor.alpha(0.1).css(),
        };
    },
    multiValueLabel: (styles, { data }) => {
        const color = data.leafletOptions?.style?.().color || 'black';
        const chromaColor = chroma(color);
        return {
            ...styles,
            color: chroma.contrast(chromaColor, 'white') > 2
                ? color
                : 'black',
        }
    },
    multiValueRemove: (styles, { data }) => {
        const color = data.leafletOptions?.style?.().color || 'black';
        return {
            ...styles,
            color: color,
            ':hover': {
                backgroundColor: color,
                color: 'black',
            },
        }
    },
};

export default vectorStyles;