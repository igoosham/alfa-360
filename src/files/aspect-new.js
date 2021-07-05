class myprop
{
  public readonly bool isPK = false;//PK KEY

  public readonly string label = null;
  public readonly EditComponent component;//наименование компонента
  public readonly bool enabled = true; // доступен ли для редактирования
  public readonly string defaultValue;//значение по умолчанию
  public readonly bool isRequered;//требуется


  public readonly string relatedAttach = null; // альт вложения с данными
  public readonly string relatedValueField = null; // поле вложения для значений комбо
  public readonly string relatedTextField = null; // поле вложения для текста комбо
  public readonly string relatedForeignKey = null; // поле в куда складывать результат

  public readonly bool isHideForFront;//спрятать для фронта

  /*
  public readonly string DataTextField;//text bind
  public readonly string DataValueField;//index bind
  public readonly string customAlt = ""; //указатель что это синтетический класс
  public readonly string SynteticMemberRef = null;

  public readonly string PKName = "";
//    public readonly string FKName = "";*/

}