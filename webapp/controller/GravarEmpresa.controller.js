sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"idxtec/lib/fragment/PaisBacenHelpDialog",
	"idxtec/lib/fragment/MunicipiosHelpDialog"
], function(Controller, History, MessageBox, JSONModel, PaisBacenHelpDialog, MunicipiosHelpDialog) {
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
		
		handleSearchPais: function(oEvent){
			var oHelp = new PaisBacenHelpDialog(this.getView(), "pais");
			oHelp.getDialog().open();
		},
		
		handleSearchMunicipios: function(oEvent){
			var oHelp = new MunicipiosHelpDialog(this.getView(), "municipio");
			oHelp.getDialog().open();
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getModel("view");
		
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
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
				
				this.getView().byId("pais").setSelectedKey("");
				this.getView().byId("uf").setSelectedKey("");
				this.getView().byId("municipio").setSelectedKey("");
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Empresa"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.information("Preencha todos os campos obrigatórios!");
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
		
		_createEmpresa: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();

			oDados.Pais = parseInt(oDados.Pais, 0);
			oDados.Uf = parseInt(oDados.Uf, 0);
			oDados.Municipio = parseInt(oDados.Municipio, 0);
			
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

			oModel.create("/Empresas", oDados, {
				success: function() {
					MessageBox.success("Empresa inserida com sucesso!");
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateEmpresa: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			
			var oDados = oJSONModel.getData();
			
			oDados.Pais = parseInt(oDados.Pais, 0);
			oDados.Uf = parseInt(oDados.Uf, 0);
			oDados.Municipio = parseInt(oDados.Municipio, 0);
			
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
			
			oModel.update(this._sPath, oDados, {
					success: function() {
					MessageBox.success("Empresa alterada com sucesso!");
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
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