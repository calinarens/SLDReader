<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [reader](#reader)
-   [StyledLayerDescriptor](#styledlayerdescriptor)
-   [Layer](#layer)
-   [FeatureTypeStyle](#featuretypestyle)
-   [Rule](#rule)
-   [Filter](#filter)
-   [Symbolizer](#symbolizer)

## reader

**Parameters**

-   `sld` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** xml string

Returns **[StyledLayerDescriptor](#styledlayerdescriptor)** object representing sld style

## StyledLayerDescriptor

a typedef for StyledLayerDescriptor

**Properties**

-   `version` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** sld version
-   `layers` **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** info extracted from NamedLayer element

## Layer

a typedef for Layer, the actual style object for a single layer

**Properties**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** layer name
-   `styles` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** 
    -   `styles[].default` **[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 
    -   `styles[].featuretypestyles` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[FeatureTypeStyle](#featuretypestyle)>** 

## FeatureTypeStyle

a typedef for FeatureTypeStyle

**Properties**

-   `rules` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Rule](#rule)>** 

## Rule

a typedef for Rule to match a feature

**Properties**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** rule name
-   `filters` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Filter](#filter)>** 
-   `symbolizers` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Symbolizer](#symbolizer)>** 

## Filter

a typedef for Filter to match a feature

**Properties**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** filter type, see [ogc filter](http://schemas.opengis.net/filter/1.1.0/filter.xsd) for possible values
-   `value` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** depends on value of type.

## Symbolizer

a typedef for [Symbolizer](http://schemas.opengis.net/se/1.1.0/Symbolizer.xsd)