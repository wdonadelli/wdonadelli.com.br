class FeriadosFinanceiros {
	/* https://www.anbima.com.br/feriados/feriados.asp */

	constructor(data = "%today") {
		this._data            = wd(data);
		this._segundaCarnaval = this._refPascoa(this._data.y, -48);
		this._tercaCarnaval   = this._refPascoa(this._data.y, -47);
		this._paixaoCristo    = this._refPascoa(this._data.y,  -2);
		this._corpusChristi   = this._refPascoa(this._data.y,  60);
	}

	_refPascoa(ano, delta = 0) { /* https://www.inf.ufrgs.br/~cabral/Pascoa.html */
		var X, Y, a, b, c, d, e, dia, mes, data;
		X = 24;
		Y = 5;
		a = ano % 19;
		b = ano % 4;
		c = ano % 7;
		d = (19 * a + X) % 30;
		e = (2 * b + 4 * c + 6 * d + Y) % 7;
		
		/* definição do dia e do mês */
		if ((d + e) > 9) {
			dia = d + e - 9;
			mes = 4;
			/* correções */
			if (dia === 26) {
				dia = 19;
			} else if (dia === 25 && d === 28 && a > 10) {
				dia = 18;
			}
		} else {
			dia = d + e + 22;
			mes = 3;
		}

		/* data da Páscoa */
		data = new wd("%today");
		data.y  = ano;
		data.m  = mes;
		data.d  = dia;
		/* Dia referenciado pela Páscoa */
		data.d += delta;

		return data;
	}

	_listaAtributos = [
		"confraternizacaoUniversal", "segundaCarnaval", "tercaCarnaval",
		"paixaoCristo", "tiradentes", "trabalho", "corpusChristi",
		"independenciaBrasil", "padroeiraBrasil", "finados",
		"proclamacaoRepublica", "natal"
	];


/*----------------------------------------------------------------------------*/

	get confraternizacaoUniversal() {return this._data.format("%Y-01-01");}
	get segundaCarnaval()           {return this._segundaCarnaval.toString();}
	get tercaCarnaval()             {return this._tercaCarnaval.toString();}
	get paixaoCristo()              {return this._paixaoCristo.toString();}
	get tiradentes()                {return this._data.format("%Y-04-21");}
	get trabalho()                  {return this._data.format("%Y-05-01");}
	get corpusChristi()             {return this._corpusChristi.toString();}
	get independenciaBrasil()       {return this._data.format("%Y-09-07");}
	get padroeiraBrasil()           {return this._data.format("%Y-10-12");}
	get finados()                   {return this._data.format("%Y-11-02");}
	get proclamacaoRepublica()      {return this._data.format("%Y-11-15");}
	get natal()                     {return this._data.format("%Y-12-25");}

	get feriados() {
		var objeto = {};
		for (var i = 0; i < this._listaAtributos.length; i++) {
			objeto[this._listaAtributos[i]] = this[this._listaAtributos[i]];
		}
		return objeto;
	}

	get feriadosDiaUtil() {
		var objeto;
		objeto = {};
		for (var i = 0; i < this._listaAtributos.length; i++) {
			var data = new wd(this[this._listaAtributos[i]]);
			if (data.week !== 1 && data.week !== 7) {
				objeto[this._listaAtributos[i]] = this[this._listaAtributos[i]];
			}
		}
		return objeto;
	}
	
	get hojeFeriado() {
		var lista = this.feriados;
		for (var i in lista) {
			if (this._data.toString() === lista[i]) return true;
		}
		return false;	
	}

	get hojeUtil() {
		if (this.hojeFeriado)      return false;
		if (this._data.week === 7) return false;
		if (this._data.week === 1) return false;
		return true;
	}	

	get diasUteisAnual() {
		var dias, feriados;
		dias     = this._data.wDaysYear;
		feriados = this.feriadosDiaUtil;
		for (var i in feriados) {dias--;}
		return dias;
	}

	get diasUteisPassados() {
		var dias, feriados, data;
		dias     = this._data.wDays;
		feriados = this.feriadosDiaUtil;
		for (var i in feriados) {
			data = new wd(feriados[i]);
			if (data > this._data) return dias;
			dias--;
		}
		return dias;
	}

	get diasUteisRestantes() {
		return this.diasUteisAnual - this.diasUteisPassados;
	}

	toString() {
		var array, lista;
		array = [""];
		lista  = this.feriados;
		for (var i in lista) {
			var data, texto;
			data  = new wd(lista[i]);
			texto = wd(wd(i).dash.replace("-", " ")).title;
			array.push(data.format("%D/%M/%Y (#w): "+texto));
		}
		array.push("");
		return array.join("\n")
	}

	valueOf() {
		return this._data.valueOf();
	}

};

/*----------------------------------------------------------------------------*/

class LTN {

	constructor(compra = "%today", vencimento = "%today", taxa = 0) {
		this._compra     = wd(compra);
		this._vencimento = wd(vencimento);
		this._taxa       = wd(taxa);
	}

	get titulo() {return "Letras do Tesouro Nacional";}
	get sigla()  {return "LTN";}
	get nome()   {return "Tesouro Prefixado"}

	get compra() { /* retorna a data da compra */
		return this._compra.format("%D/%M/%Y");
	}

	get vencimento() { /* retorna a data do vencimento */
		return this._vencimento.format("%D/%M/%Y");
	}

	get taxa() { /* retorna a taxa aplicada */
		return this._taxa.valueOf();
	}

	get vna() { /* retorna o Valor Nominal Atualizado */
		return 1000;
	}

	get cupons() { /* retorna informação sobre cupons */
		return [];
	}

	get preco() { /* retorna o preço do título */
		var cotacao = this._cotacao(this._taxa.valueOf(), this.du);
		return this.vna/cotacao;
	}

	get du() { /* retorna os dias úteis entre a compra e o vencimento */
		return this._du(this._compra.toString(), this._vencimento.toString());
	}

	get dias() { /* retorna os dias entre a compra e o vencimento */
		return (this._vencimento - this._compra);
	}

	get iof() { /* retorna a alíquota de IOF no vencimento */
		return this._iof(this.dias);
	}

	get irpf() { /* retorna a alíquota de IRPF no vencimento */
		return this._irpf(this.dias);
	}

	get custodia() {/* retorna a alíquota de custódia total */
		var n, ref1, ref2, taxa;
		n = 0;
		taxa = Math.sqrt(1 + 0.003) - 1;

		/* inicio */
		ref1 = this._compra.toString();
		ref2 = this._compra.format("%Y-07-01");
		if (ref1 < ref2) {n++;}
		/* fim */
		ref1 = this._vencimento.toString();
		ref2 = this._vencimento.format("%Y-07-01");
		if      (ref1  >  ref2) {n += 3;}
		else if (ref1 === ref2) {n += 2;}
		else                    {n++;}
		/* meio */
		n += 2 * (this._vencimento.y - this._compra.y - 1);

		return n * taxa;
	}

	get delta() { /* retorna a diferença entre o vna e o preço */
		return (this.vna - this.preco);
	}

	get custos() { /* retorna o valor de gastos com tributos (IOF e IRPF) */
		var custos = 0;
		custos += this.delta * this.iof;
		custos += this.delta * this.irpf;
		custos += this.preco * this.custodia;
		return custos;
	}

	get rendTotal() { /* retorna o rendimento total (até o vencimento) */
		return (this.vna/this.preco) - 1;
	}

	get rendBruto() { /* retorna o rendimento bruto anual (até o vencimento)*/
		return (this._cotacao(this.rendTotal, 252, this.du) - 1);
	}

	get rendLiquido() { /* retorna o rendimento líquido anual (até o vencimento)*/
		var valor = ((this.vna - this.custos)/this.preco) - 1;
		return (this._cotacao(valor, 252, this.du) - 1);
	}

	/* funções escondidas */
	_du(inicio, fim) { /*dias úteis*/
		var dias, data1, data2, data3;
		inicio = wd(inicio);
		fim    = wd(fim);
		data1  = new FeriadosFinanceiros(inicio.toString());
		data2  = new FeriadosFinanceiros(fim.toString());
		dias   = data1.diasUteisRestantes + data2.diasUteisPassados;
		inicio.y++;
		while (inicio.y < fim.y) {
			data3 = new FeriadosFinanceiros(inicio.toString());
			dias += data3.diasUteisAnual;
			inicio.y++;
		}

		return data2.hojeFeriado ? dias : dias - 1;
	}

	_cotacao(taxa, num = 0, den = 252) {
		return Math.pow((1 + taxa), (num/den));
	}

	_iof(dias) {
		var tabela = [
			1, 0.96, 0.93, 0.9, 0.86, 0.83, 0.8, 0.76, 0.73, 0.7, 0.66, 0.63, 0.6,
			0.56, 0.53, 0.5, 0.46, 0.43, 0.4, 0.36, 0.33, 0.3, 0.26, 0.23, 0.2,
			0.16, 0.13, 0.1, 0.06, 0.03, 0
		];
		if (dias > tabela.length) return 0;
		return tabela[dias];
	}

	_irpf(dias) {
		if (dias <= 180) return 0.225;
		if (dias <= 360) return 0.200;
		if (dias <= 720) return 0.175;
		return 0.150;
	}
}

/*----------------------------------------------------------------------------*/

class NTN_F extends LTN {

	constructor(compra, vencimento, taxa, indexacao = 0) {
		super(compra, vencimento, taxa);
		this._indexacao = wd(indexacao)
	}

	get titulo() {return "Notas do Tesouro Nacional Série F";}
	get sigla()  {return "NTN-F";}
	get nome()   {return "Tesouro Prefixado com Juros Semestrais"}


}






















function start() {
	var hoje, obj;
	hoje = wd("21.04.2020");
	obj = new FeriadosFinanceiros(hoje.toString());
	if (obj.hojeUtil === false) {wd("Hoje não é um dia útil!").message(6000, "wd-icon-warn wd-bg-red wd-align-center");}
	wd$("#compra").item(0).value = hoje.format("%D.%M.%Y");
	return;
}

wd(window).handler({
	load: start,
});
