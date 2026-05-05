package com.example.pronemod;

import net.minecraft.client.KeyMapping;
import net.minecraft.world.entity.Pose;
import net.minecraft.world.entity.player.Player;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.event.lifecycle.FMLClientSetupEvent;
import net.neoforged.neoforge.client.event.ClientTickEvent;
import net.neoforged.neoforge.client.event.RegisterKeyMappingsEvent;
import org.lwjgl.glfw.GLFW;

@Mod("pronemod")
public class ProneMod {

    public static KeyMapping keyProne;
    
    // Храним состояние лежания для каждого игрока (на клиенте)
    public static boolean isPlayerProne = false;

    public ProneMod() {
        net.neoforged.fml.ModLoader.getEventBus().register(this);
    }

    @SubscribeEvent
    public void onClientSetup(FMLClientSetupEvent event) {
        event.enqueueWork(() -> {
            // Инициализация на клиенте
        });
    }

    @SubscribeEvent
    public void registerKeyMappings(RegisterKeyMappingsEvent event) {
        keyProne = new KeyMapping(
            "key.pronemod.prone",
            GLFW.GLFW_KEY_Z,
            "category.pronemod.actions"
        );
        event.register(keyProne);
    }

    @SubscribeEvent
    public void onClientTick(ClientTickEvent.Post event) {
        if (keyProne != null && keyProne.consumeClick()) {
            Player player = net.minecraft.client.Minecraft.getInstance().player;
            if (player != null) {
                toggleProne(player);
            }
        }
    }

    private void toggleProne(Player player) {
        isPlayerProne = !isPlayerProne;
        
        if (isPlayerProne) {
            // Ложимся - устанавливаем позу плавания (она горизонтальная)
            player.setPose(Pose.SWIMMING);
        } else {
            // Встаем - возвращаемся в обычную стойку
            player.setPose(Pose.STANDING);
        }
    }
}
