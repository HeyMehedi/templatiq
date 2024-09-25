import Styled from 'styled-components';

const SearchformStyle = Styled.div`
    position: relative;
    height: 38px;
    padding: 0;
    display: flex;
    align-items: center;
    background-color: var(--templatiq-sec-color);
    border-radius: 8px;
    button {
        position: absolute;
        inset-inline-start: 16px;
        top: 10px;
        padding: 0;
        background: transparent;
    }
    input[type="text"] {
        width: 100%;
        height: 100%;
        border: none;
        padding: 0 42px;
        background: transparent;
        box-shadow: var(--templatiq-box-shadow);
        outline: none;
        transition: box-shadow 0.3s ease;
        &::placeholder {
            color: var(--templatiq-placeholder-color);
        }
        &:focus {
            box-shadow: var(----templatiq-box-shadow-focus);
        }
    }
    .templatiq__content__top__searchbox__clear {
        position: absolute;
        inset-inline-end: 12px;
        top: 10px;
        cursor: pointer;
    }
`;

export { SearchformStyle };
