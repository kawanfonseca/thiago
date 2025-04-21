ICMS-ST Combustíveis – Restituição 2017/2018 



1-	Identificando os combustíveis no SPED

O primeiro passo é identificar quais itens serão trabalhados (combustíveis), o que deve ser feito pelo registro 0200 e 0206 dos SPEDs fiscais e onde consta o cadastro de produtos da empresa e código ANP.

Previamente, é importante destacar que os produtos trabalhados serão sempre combustíveis para os períodos de 2017 e 2018. 

Os exemplos mais comuns são:

•	Gasolina (Comum e Aditivada)
•	Etanol
•	Diesel / Óleo Diesel
•	GNV

Para identificar os combustíveis nos SPEDs fiscais, a melhor opção é buscar pelo código ANP, cabe salientar que buscar pelo nome não é uma boa opção pelo fato de que cada estabelecimento escreve a “descrição do item” de forma distinta. 

No SPED existe o registro 0200 e o registro 0206 (somente para produtos derivados de petróleo). O registro 0200 está atrelado a apresentação do produto, ele vem da seguinte forma:
	
|0200|2368-1|GASOLINA C COMUM|||14|99|27101259||||17,00||
|0206|320102001|

Para o sistema identificar quais os produtos que ele deve buscar é necessário que os SPEDs estejam preenchidos com o registro 0206 abaixo do registro 0200.

O registro 0206 é preenchido com os códigos ANPs dos combustíveis:

Combustível	ANP	Alíquota ICMS (%)
Gasolina C Comum	320102001	25
Gasolina Aditivada	320102002	25
Diesel S10	820101034	12
Etanol	810101001	25
Gasolina A Premium	320101002	25
Óleo Diesel B S1800	820101011	12
Gasolina A Comum	320101001	25
Óleo Diesel B S50 Comum	820101029	12
Óleo Diesel B20 S50 Comum	820101030	12
Etanol Hid	210301001	25
Gasolina C Premium	320102003	25
Óleo Diesel B S500 - COMUM	820101012	12
Gás Natural Veicular	220101005	17
Óleo Diesel B S10 - Aditivado	820101033	12
Etanol Anidro	810102001	25
DIESEL B4 S500 - COMUM	820101008	12
Diesel	820101013	12
DIESEL B10	820101004	12
GNV Comprimido	220101003	17

Assim, a partir do momento que o produto é identificado como combustível o sistema deverá buscar o código daquele produto (campo 02 do registro 0200) nos registros C170 e C425 (será visto em seguida).

2-	Identificando as compras pelo registro C100

O registro C100, chamado também de “registro-pai”, informa a chave da nota fiscal. As chaves das notas fiscais serão encontradas no campo 09 dos registros C100.

 Assim, para buscar as notas fiscais de combustível, primeiro deve-se filtrar os registros C100s, para somente aqueles que possuem o campo 02 preenchido com “0” e o campo 03 preenchido com “1”. Isso indica que são notas ficais de entrada, a qual queremos no momento.

Posteriormente, para identificar todos os combustíveis que foram comprados pelos estabelecimentos, o sistema deverá buscar pelo código do produto, daqueles que estavam com 0206 (código ANP) abaixo do 0200, no registro C170 (registro-filho do C100). 

2.1 Gerar lista de notas fiscais de combustíveis

Além disso, é nesse momento que será possível gerar uma lista com todas as notas fiscais de compra de combustíveis. Vejamos:

Cada registro C100 possui uma chave de nota fiscal. Para “filtrar” as notas fiscais que serão de combustíveis basta coletar as chaves de notas que (1) possuem o campo 02 preenchido com “0” e o campo 03 preenchido com “1” e (2) possuem código de combustível no seu “registro-filho” o registro C170.

|C100|0|1|FOR000000089|55|00|001|79811|42210802494950000145550010000798111568757646|05082021|06082021|47835|1|0|0|47835|0|0|0|0|0|0|0|0|0|0|0|0|0|
|C170|1|2838||5000|58|25180|0|0|060|1652|11|0|0|0|0|0|0||||0|0|0|73|0|0|0|0|0|73|0|0|0|0|0|25|0|
|C170|2|1113||2500|58|10040|0|0|060|1652|11|0|0|0|0|0|0||||0|0|0|73|0|0|0|0|0|73|0|0|0|0|0|25|0|
|C170|3|1137||2500|58|12615|0|0|060|1652|11|0|0|0|0|0|0||||0|0|0|73|0|0|0|0|0|73|0|0|0|0|0|25|0|
|C190|060|1652|0|47835|0|0|0|0|0|0||

O exemplo acima mostra que no registro C100 a chave de nota fiscal deve ser coletada, visto que os três códigos destacados no C170 são de combustíveis (exemplo) e que são notas fiscais de entrada (campo 02 do registro C100). 

Em resumo, caso algum código do registro C170 seja de combustível, a chave de nota fiscal do seu “registro-pai” (C100) deve ser colocada na lista de notas.

2.3 Registro C170

O registro C170 apresenta os itens das notas fiscais de compras feita pelo estabelecimento, mostrando informações como quantidade de litros comprado, valor pago etc.

Abaixo um exemplo do registro C100 e C170 no SPED:

|C100|0|1|FOR000000004|55|00|001|12980|42180605204831000107550010000129801000062300|27062018|27062018|80218,47|2|0,00|0,00|80218,47|9|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|
|C170|1|1734-1||2129,5500|14|6495,13|0,00|0|060|1652|57|0,00|0,00|0,00|0,00|0,00|0,00||||0,00|0,00|0,00|73|6495,13|0,0000|0,000|0,0000|0,00|73|6495,13|0,0000|0,000|0,0000|0,00|59|

Portanto as informações mais relevantes para o momento, que se colhe do registro C170 acima são: 

Campo 03 - Código de produto: 1734-1
Campo 05 - Quantidade do item: 2.129,55
Campo 06 – Unidade do item: 14 (Litros, como vimos no tópico acima – registro C190)
Campo 07 – Valor pago do item: R$ 6.495,13

Ou seja, sabemos que foi comprado 2.129,55 mil litros de Gasolina Comum pelo valor de R$ 6.495,13 naquela nota fiscal.

Nesta etapa é importante que o sistema busque, portanto, todas as compras feitas pelo estabelecimento, dos combustíveis presentes naquele SPED.

Ao final da procura por todos os códigos de combustíveis no C170, será possível, através dos dados coletados, consolidar as informações, gerando um “relatório” de quantidade e valor que foi comprado cada combustível naquele mês. 

3-	Identificando as vendas por cupons fiscais (C420/C425)

Nessa etapa, o sistema deve buscar todas as vendas feitas pelo estabelecimento, através da emissão do cupom fiscal.

O registro C420 (registro-pai) é a consolidação de tudo que foi vendido na máquina de cupom fiscal. Quando o campo 02 do registro C420 estiver com “Fn” significa que todos os produtos daquela máquina de cupom fiscal possuem substituição tributária.

|C420|Can-T|5|||
|C420|F1|11598,66|||
|C425|1077|1|212|13|0,21|0,99|
|C425|1113|385,772|58|1648,1|0|0|
|C425|00000000001117|1|212|3,75|0,06|0,29|

Este é o primeiro filtro a se fazer, ou seja, buscar os códigos de produtos (combustíveis) que estiverem abaixo do C420 que possuir o campo 02 preenchido com “Fn”.

Nesse caso, o código de produtos será buscado no registro C425, chamado também de “registro filho” do C420, o qual apresenta as vendas feitas pelo estabelecimento através do cupom fiscal. 

Abaixo um exemplo do registro C425:

|C425|2368-1|3995,840|14|16719,26|0,00|0,00|

A partir do registro acima colhe-se as seguintes informações:

Campo 02 - Código de produto: 2368-1
Campo 03 - Quantidade do item: 3.995,840
Campo 04 – Unidade do item: 14 (Litros)
Campo 05 – Preço do item: R$ 16.719,26

Abaixo a tabela com a descrição de todos os campos do registro C425:

 

Nesta etapa é importante que o sistema busque, portanto, todas as vendas feitas pelo estabelecimento, dos combustíveis presentes naquele SPED.

Ao final da procura por todos os códigos de combustíveis no C425, será possível, através dos dados coletados, consolidar as informações, gerando um “relatório” de quantidade e valor que foi vendido cada combustível naquele mês. 

4- Preço Médio Ponderado ao Consumidor Final – PMPF

Cada combustível possui um Preço Médio Ponderado ao Consumidor Final - PMPF (também chamado de preço de pauta), este valor é uma fixação estipulada pela administração tributária dos estados. Assim, os combustíveis tem o imposto do ICMS-ST antecipado com base no PMPF daquele período. 

O PMPF é por Estado, e a cada 15 dias o valor é atualizada ou é mantido o mesmo. Desse modo, é importante que o sistema tenha registrado o preço de pauta de todos os combustíveis de 2016 a 2022.

Desse modo, um exemplo do que ocorre:

Compra gasolina: R$ 5,00 (preço de pauta/PMPF)
Vende gasolina: R$ 4,50
Diferença: R$ 0,50
Restituição: Nesse caso, como estamos trabalhando com o exemplo da gasolina, a alíquota de ICMS-ST é de 25%, portanto calcula-se:
 R$ 0,50 x 25% (0,25) = R$ 0,125

O estabelecimento compra 1 litro de gasolina comum pelo valor de R$ 5,00 (preço de pauta do mês X), no entanto vende esse mesmo litro pelo valor de R$ 4,50, portanto, com a alíquota de ICMS-ST da gasolina sendo 25%, calcula-se que esse estabelecimento possui R$ 0,125 de restituição para 1 litro de gasolina vendido.

Link para pegar todos os preços de pautas: https://www.confaz.fazenda.gov.br/legislacao/atos-pmpf

Alíquotas de ICMS-ST dos combustíveis:

Combustível	Alíquota ICMS-ST
Gasolina Comum, Aditivada, Premium, Podium	25%
Etanol	25%
Gás Natural Veicular - GNV	17%
Diesel S10 / Óleo Diesel	12%

5 - Elaboração Relatório

A partir das informações coletadas até o presente momento, o sistema irá começar a elaborar a preliminar dos cálculos.

5.1 Relatório – VendaxPauta

Ao adicionar somente os SPEDs fiscais no sistema para elaboração do cálculo, será possível criar a aba “VendaxPauta”, a qual contará com as seguintes informações:

a) Coluna 1: Identificação do combustível

Pegar todos os combustíveis encontrados em cada SPED (através do registro 0206) e criar uma coluna com a lista de todos eles mês a mês.

b) Coluna 2: Mês de referência

Separar cada combustível pelo mês de referência de cada SPED. Para coletar essa informação, o período de referência está na primeira linha do SPED nos campos 04 (data inicial) e 05 (data final). 

c) Coluna 3: Preço de pauta do combustível naquele mês

O PMPF (preço de pauta) de cada combustível já estará registrado no próprio sistema, ou seja, a partir do momento que é identificado o combustível e sabe-se o período de referência dele, já é possível vincula-lo ao seu preço de pauta.

Vejamos um exemplo destas três colunas citadas acima:

 


Além disso, como exposto no tópico 4, o preço de pauta é atualizado a cada 15 dias, nesse caso, quando haver duas pautas diferentes para um mesmo mês, basta separar da seguinte forma:

 

Para identificar em qual quinzena o combustível foi vendido deverá ser coletada essa informação do registro C405 (este registro é apresentado com as informações da Redução Z de cada equipamento em funcionamento na data das operações de venda à qual se refere a redução), ou seja, no momento em que for identificado que naquele registro C425 há combustível, será possível identificar o dia em que ocorreu a venda, buscando pelo seu registro C405. Vejamos o exemplo abaixo:


|C405|01032018|1|15|9000|469768,44|39234,98|
|C410|5,84|26,95|
|C420|F1|11598,66|||
|C425|102|1|212|7,9|0,05|0,24|
|C425|104|1|212|27,9|0,18|0,84|

No exemplo acima mostra que aquelas vendas do cupom fiscal foram feitas no dia 01/03/2018.

Portanto, deve-se conferir em qual dia foi vendido aquele combustível, e, assim, buscar o seu respectivo preço de pauta.


d) Coluna 4: Quantidade total vendida de cada combustível em cada mês

Nesse caso, será feito a consolidação de toda a quantidade de litros vendidos de cada combustível mês a mês. Para isso, a informação será coletada do registro C425. 

Portanto, para coletar a quantidade de gasolina (por exemplo) vendida em um período, basta buscar todos os registros C425 que possuírem o código da gasolina, e somar o campo 03 de todos eles. 

No exemplo abaixo, mostra que naquele cupom fiscal foi vendido 725,009 litros de gasolina, (nesse caso, deve-se somar esse valor com todos os outros campos 03 do C425 que possui o código da gasolina).

|C420|F2|7966,56|||
|C425|1|725,009|L|2852,58|0|0|

e) Coluna 5: Valor total vendido de cada combustível em cada mês.

Nesse caso, será feito a consolidação de todo valor vendido de cada combustível mês a mês. Para isso, a informação também será coletada do registro C425. 

Portanto, para coletar o valor de gasolina vendida em um período, basta buscar todos os registros C425 que possuírem o código da gasolina, e somar o campo 05 de todos eles. 

No mesmo exemplo acima, mostra que naquele cupom fiscal foi vendido 725,009 litros pelo valor de R$ 2.852,58 de gasol ina, (nesse caso, deve-se somar esse valor com todos os outros campos 05 do C425 que possui o código da gasolina).

Desse modo, as informações deverão ser colocadas em uma planilha dessa forma:



f) Coluna 6: Valor unitário da venda do combustível

Agora, para elaborar essa coluna, deve ser feito um cálculo simples. O sistema deverá pegar o valor total vendido de combustível e dividir pela sua quantidade vendida, assim será possível saber por quanto o estabelecimento vendeu cada litro de combustível.

Por exemplo: 

Valor total vendido de gasolina no mês de dez/2018: R$ 386.619,04
Quantidade total vendida de gasolina no mês de dez/2018: 98.772,87 Litros
(386.619,04 /98.772,87 = R$ 3,91)
Portanto,
Valor da unidade vendida de gasolina no mês de dez/2018: R$ 3,92

g) Coluna 7: Diferença entre o preço de pauta e o valor vendido

Nessa etapa será feito o cálculo da diferença entre o preço de pauta estipulado e o valor que foi de fato vendido o combustível. Conforme o exemplo destacado abaixo:

  

h) Coluna 8: Total a restituir

Por fim, na última coluna constará o cálculo do imposto a restituir ou complementar. 

Será feito o seguinte cálculo:

Exemplo: Gasolina Comum
Alíquota: 25%
Preço de Pauta: R$ 4,33 (1 litro)
Valor que foi vendida: R$ 3,91 (1 litro)
Diferença: R$ 0,42 (1 litro)
Restituição: R$ 0,42 x 25% = R$ 0,105 (1 litro)
Total de litros vendidos no mês X de gasolina: 98.772,87 Litros
Imposto a restituir de gasolina no mês X: R$ 10.371,15 (98.772,87 x 0,105)

 

Logo, após seguir os passos relatados acima, será possível elaborar o relatório de “VendaXpauta” e a partir dele podemos ter uma ideia preliminar de quanto o estabelecimento terá para restituir.