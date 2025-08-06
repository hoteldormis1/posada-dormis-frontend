import LoginIzquierda from "./ui/sections/LoginIzquierda/index";
import LayoutWrapper from "./ui/sections/LayoutWrapper/index";
import Navbar from "./ui/sections/Navbar/index";
import Footerbar from "./ui/sections/Footerbar/index";
import FiltroFechas from "./ui/uiComponents/Dashboard/FiltroFechas";
import HotelEstadisticas from "./ui/uiComponents/Dashboard/HotelEstadisticas";
import GraficoCantidadDeReservas from "./ui/uiComponents/Dashboard/Graficos/Widgets/GraficoVertical/CantidadDeReservas";
import GraficoCantidadDeVentas from "./ui/uiComponents/Dashboard/Graficos/Widgets/GraficoVertical/CantidadDeVentas";
import GraficoVertical from "./ui/uiComponents/Dashboard/Graficos/Components/GraficoVertical";
import GraficosContent from "./ui/uiComponents/Dashboard/Graficos";
import GraficoPie from "./ui/uiComponents/Dashboard/Graficos/Components/GraficoPie"
import GraficoPieEstadoHabitaciones from "./ui/uiComponents/Dashboard/Graficos/Widgets/GraficoPieEstadoHabitaciones";
import Paginator from "./ui/sections/Paginator";
import LoadingSpinner from "./ui/uiComponents/LoadingSpinner";
import TableComponent from "./ui/uiComponents/TableComponent";
import LoginForm from "./forms/forms/LoginForm";
import CloseButton from "./ui/buttons/CloseButton";
import BackButton from "./ui/buttons/BackButton";
import AppIcon from "./ui/icons/AppIcon";
import PopupContainer from "./forms/popups/PopupContainer";
import PopupFormAgregar from "./forms/popups/PopupFormAgregar";
import PopupFormEditar from "./forms/popups/PopupFormEditar";
import DynamicInputField from "./forms/formComponents/DynamicInputField/index"

export {
	LoginIzquierda,
	Footerbar,
	LayoutWrapper,
	Navbar,
	TableComponent,
	FiltroFechas,
	HotelEstadisticas,
	GraficosContent,
	GraficoCantidadDeReservas,
    GraficoVertical,
	GraficoCantidadDeVentas,
	GraficoPie,
	GraficoPieEstadoHabitaciones,
	Paginator,
	LoadingSpinner,
	LoginForm,
	CloseButton,
	BackButton,
	AppIcon,
	PopupContainer,
	PopupFormAgregar,
	PopupFormEditar,
	DynamicInputField
};
