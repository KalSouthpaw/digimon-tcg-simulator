package com.github.wekaito.backend.websocket;

public record GameCard(
        String id,
        Boolean isTilted,
        String name,
        String type,
        String color,
        String image_url,
        String cardnumber,
        String stage,
        String attribute,
        String digi_type,
        Integer dp,
        Integer play_cost,
        Integer evolution_cost,
        Integer level,
        String maineffect,
        String soureeffect

) {

}