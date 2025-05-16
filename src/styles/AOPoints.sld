<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" 
                       xmlns:ogc="http://www.opengis.net/ogc" 
                       xmlns:se="http://www.opengis.net/se" 
                       xmlns:xlink="http://www.w3.org/1999/xlink" 
                       version="1.1.0" 
                       xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd"
                       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <se:Name>test_punkt</se:Name>
    <UserStyle>
      <se:Name>test_punkt</se:Name>
      <se:FeatureTypeStyle>
        <se:Rule>
          <se:Name>Point Symbol</se:Name>
          <se:PointSymbolizer>
            <se:Graphic>
              <se:Mark>
                <se:WellKnownName>square</se:WellKnownName>
                <se:Fill>
                  <se:SvgParameter name="fill">#4a90e2</se:SvgParameter>
                </se:Fill>
                <se:Stroke>
                  <se:SvgParameter name="stroke">#ffffff</se:SvgParameter>
                  <se:SvgParameter name="stroke-width">1</se:SvgParameter>
                </se:Stroke>
              </se:Mark>
              <se:Size>16</se:Size>
            </se:Graphic>
          </se:PointSymbolizer>
        </se:Rule>
        <se:Rule>
          <se:Name>Label</se:Name>
          <!-- Remove any MaxScaleDenominator or MinScaleDenominator if they exist -->
          <se:TextSymbolizer>
            <se:Label>
              <ogc:PropertyName>storagedisplayid</ogc:PropertyName>
            </se:Label>
            <se:Font>
              <se:SvgParameter name="font-family">Arial</se:SvgParameter>
              <se:SvgParameter name="font-size">10</se:SvgParameter>
              <se:SvgParameter name="font-style">normal</se:SvgParameter>
            </se:Font>
            
            <!-- Added VendorOptions to control label placement -->
            <se:VendorOption name="conflictResolution">false</se:VendorOption>
            <se:VendorOption name="autoWrap">60</se:VendorOption>
            <se:VendorOption name="spaceAround">0</se:VendorOption>
            <se:VendorOption name="goodnessOfFit">0</se:VendorOption>
            <se:VendorOption name="forceLeftToRight">true</se:VendorOption>
          </se:TextSymbolizer>
        </se:Rule>
      </se:FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
