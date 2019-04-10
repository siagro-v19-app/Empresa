sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecEmpresa/helpers/UfHelpDialog",
	"br/com/idxtecEmpresa/helpers/PaisBacenHelpDialog",
	"br/com/idxtecEmpresa/helpers/MunicipiosHelpDialog"
], function(Controller, History, MessageBox, JSONModel, UfHelpDialog, PaisBacenHelpDialog, MunicipiosHelpDialog) {
	"use strict";

	return Controller.extend("br.com.idxtecEmpresa.controller.GravarEmpresa", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarempresa").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		ufReceived: function() {
			this.getView().byId("uf").setSelectedKey(this.getModel("model").getProperty("/Uf"));
		},
		
		municipioReceived: function() {
			this.getView().byId("municipio").setSelectedKey(this.getModel("model").getProperty("/Municipio"));
		},
		
		paisBacenReceived: function() {
			this.getView().byId("pais").setSelectedKey(this.getModel("model").getProperty("/Pais"));
		},
		
		handleSearchUf: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			UfHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchMunicipio: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			MunicipiosHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchPais: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			PaisBacenHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getModel("view");
		
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("pais").setValue(null);
			this.getView().byId("uf").setValue(null);
			this.getView().byId("municipio").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Nova Empresa"
				});
			
				var oNovaEmpresa = {
					"Id": 0,
					"RazaoSocial": "",
					"Cnpj": "",
					"NomeFantasia": "",
					"InsEstadual": "",
					"RegimeTributario": "SIMPLES_NACIONAL",
					"Contato": "",
					"Email": "",
					"Pais": 0,
					"Uf": 0,
					"Municipio": 0,
					"Cep": "",
					"Bairro": "",
					"Logradouro": "",
					"Numero": "",
					"Complemento": "",
					"Telefone": ""
				};
				
				oJSONModel.setData(oNovaEmpresa);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Empresa"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createEmpresa();
			} else if (this._operacao === "editar") {
				this._updateEmpresa();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					oRouter.navTo("empresa", {}, true);
				}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.Pais = oDados.Pais ? oDados.Pais : 0;
			oDados.Uf = oDados.Uf ? oDados.Uf : 0;
			oDados.Municipio = oDados.Municipio ? oDados.Municipio : 0;
			
			oDados.PaisBacenDetails = {
				__metadata: {
					uri: "/PaisBacens(" + oDados.Pais + ")"
				}
			};
			
			oDados.UfDetails = {
				__metadata: {
					uri: "/Ufs(" + oDados.Uf + ")"
				}
			};
			
			oDados.MunicipioDetails = {
				__metadata: {
					uri: "/Municipios(" + oDados.Municipio + ")"
				}
			};
			
			return oDados;
		},
		
		_createEmpresa: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.create("/Empresas", this._getDados(), {
				success: function() {
					MessageBox.success("Empresa inserida com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				}
			});
		},
		
		_updateEmpresa: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Empresa alterada com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("razaosocial").getValue() === "" || oView.byId("cnpj").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack(); 
		},
		
		getModel: function(sModel){
			return this.getOwnerComponent().getModel(sModel);
		}
	});

});